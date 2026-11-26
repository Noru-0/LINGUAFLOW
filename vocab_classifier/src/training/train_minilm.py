"""Fine-tune Multi-task Hierarchical MiniLM with masked subtopic loss & early stopping."""

from __future__ import annotations

import argparse
import math
import random
import time
from pathlib import Path
from typing import Any

import numpy as np
import torch
from torch.utils.data import DataLoader, Dataset

from src.data.common import PACKAGE_ROOT, load_json, load_records, load_taxonomy, save_json
from src.data.preprocess import build_model_text
from src.evaluation.metrics import evaluate_hierarchical_predictions
from src.models.baselines import compute_power_class_weights
from src.models.hierarchical_classifier import (
    DEFAULT_MODEL_CONFIG_PATH,
    HierarchicalVocabClassifier,
    ModelConfig,
    apply_hierarchy_mask,
    load_encoder_and_tokenizer,
)

DEFAULT_TRAIN_CONFIG_PATH = PACKAGE_ROOT / "configs" / "train_config.json"


def _resolve_path(path_value: str | Path) -> Path:
    path = Path(path_value)
    return path if path.is_absolute() else PACKAGE_ROOT / path


def _set_seed(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


class VocabSenseDataset(Dataset):
    """Dataset of vocabulary senses with main-topic and trust-masked subtopic targets."""

    def __init__(
        self,
        records: list[dict[str, Any]],
        taxonomy: dict[str, Any],
        *,
        mask_untrusted_subtopics: bool = True,
    ) -> None:
        label2id: dict[str, int] = taxonomy["label2id"]
        subtopic2id: dict[str, int] = taxonomy["subtopic2id"]
        subtopic_name_to_id: dict[str, str] = taxonomy["subtopic_name_to_id"]

        self.texts: list[str] = []
        self.main_labels: list[int] = []
        self.subtopic_labels: list[int] = []
        self.eval_subtopic_labels: list[int] = []

        for rec in records:
            text = rec.get("text") or build_model_text(rec)
            main_id = rec.get("label_id")
            if main_id is None:
                main_id = label2id[rec["main_topic"]]

            sub_id = rec.get("subtopic_label_id")
            if sub_id is None:
                raw_sub = rec.get("subtopic_id") or rec.get("subtopic")
                canonical = subtopic_name_to_id.get(raw_sub, raw_sub)
                sub_id = subtopic2id[canonical] if canonical in subtopic2id else -100

            is_trusted = bool(rec.get("is_trusted_subtopic", True))
            train_sub_id = int(sub_id) if (not mask_untrusted_subtopics or is_trusted) else -100

            self.texts.append(str(text))
            self.main_labels.append(int(main_id))
            self.subtopic_labels.append(train_sub_id)
            self.eval_subtopic_labels.append(int(sub_id))

    def __len__(self) -> int:
        return len(self.texts)

    def __getitem__(self, idx: int) -> tuple[str, int, int, int]:
        return (
            self.texts[idx],
            self.main_labels[idx],
            self.subtopic_labels[idx],
            self.eval_subtopic_labels[idx],
        )


def _make_collate_fn(tokenizer: Any, max_length: int):
    def _collate(batch: list[tuple[str, int, int, int]]) -> dict[str, torch.Tensor]:
        texts, main_y, sub_y, eval_sub_y = zip(*batch)
        enc = tokenizer(
            list(texts),
            padding=True,
            truncation=True,
            max_length=max_length,
            return_tensors="pt",
        )
        return {
            "input_ids": enc["input_ids"],
            "attention_mask": enc["attention_mask"],
            "main_labels": torch.tensor(main_y, dtype=torch.long),
            "subtopic_labels": torch.tensor(sub_y, dtype=torch.long),
            "eval_subtopic_labels": torch.tensor(eval_sub_y, dtype=torch.long),
        }

    return _collate


def _build_linear_warmup_scheduler(
    optimizer: torch.optim.Optimizer,
    total_steps: int,
    warmup_ratio: float,
) -> torch.optim.lr_scheduler.LambdaLR:
    warmup_steps = max(1, int(total_steps * warmup_ratio))

    def _lr_lambda(step: int) -> float:
        if step < warmup_steps:
            return float(step + 1) / float(warmup_steps)
        remaining = max(1, total_steps - warmup_steps)
        progress = float(step - warmup_steps) / float(remaining)
        return max(0.0, 1.0 - progress)

    return torch.optim.lr_scheduler.LambdaLR(optimizer, _lr_lambda)


def _freeze_bottom_encoder_layers(encoder: torch.nn.Module, num_layers: int) -> None:
    if num_layers <= 0:
        return
    layers = getattr(getattr(encoder, "encoder", None), "layer", None)
    if layers is None:
        return
    for layer in list(layers)[:num_layers]:
        for param in layer.parameters():
            param.requires_grad = False


@torch.no_grad()
def evaluate_finetuned_model(
    model: HierarchicalVocabClassifier,
    dataloader: DataLoader,
    taxonomy: dict[str, Any],
    device: str | torch.device = "cpu",
) -> tuple[dict[str, Any], dict[str, list[Any]]]:
    """Evaluate fine-tuned model on a split and return metrics + prediction arrays."""
    was_training = model.training
    model.eval()

    y_main_true: list[int] = []
    y_main_pred: list[int] = []
    y_sub_true: list[int] = []
    y_sub_e2e: list[int] = []
    y_sub_oracle: list[int] = []
    main_probs_list: list[np.ndarray] = []
    sub_probs_list: list[np.ndarray] = []

    for batch in dataloader:
        input_ids = batch["input_ids"].to(device)
        attention_mask = batch["attention_mask"].to(device)
        main_y = batch["main_labels"].to(device)

        outputs = model(input_ids, attention_mask, teacher_forcing=False)
        main_logits = outputs["main_logits"]
        raw_sub_logits = outputs["subtopic_logits"]
        masked_e2e_logits = outputs["masked_subtopic_logits"]

        oracle_outputs = model(
            input_ids,
            attention_mask,
            given_main_labels=main_y,
        )
        masked_oracle_logits = oracle_outputs["masked_subtopic_logits"]

        m_probs = torch.softmax(main_logits, dim=-1).cpu().numpy()
        s_probs = torch.softmax(masked_e2e_logits, dim=-1).cpu().numpy()

        y_main_true.extend(batch["main_labels"].tolist())
        y_main_pred.extend(main_logits.argmax(dim=-1).cpu().tolist())
        y_sub_true.extend(batch["eval_subtopic_labels"].tolist())
        y_sub_e2e.extend(masked_e2e_logits.argmax(dim=-1).cpu().tolist())
        y_sub_oracle.extend(masked_oracle_logits.argmax(dim=-1).cpu().tolist())
        main_probs_list.append(m_probs)
        sub_probs_list.append(s_probs)

        _ = apply_hierarchy_mask  # keep referenced cleanly
        _ = raw_sub_logits

    metrics = evaluate_hierarchical_predictions(
        y_main_true=y_main_true,
        y_main_pred=y_main_pred,
        y_sub_true=y_sub_true,
        y_sub_pred_e2e=y_sub_e2e,
        y_sub_pred_oracle=y_sub_oracle,
        taxonomy=taxonomy,
    )
    if was_training:
        model.train()

    preds = {
        "y_main_true": y_main_true,
        "y_main_pred": y_main_pred,
        "y_sub_true": y_sub_true,
        "y_sub_pred_e2e": y_sub_e2e,
        "y_sub_pred_oracle": y_sub_oracle,
        "main_probs": np.vstack(main_probs_list) if main_probs_list else np.empty((0, 11)),
        "sub_probs": np.vstack(sub_probs_list) if sub_probs_list else np.empty((0, 45)),
    }
    return metrics, preds


def _get_monitor_score(metrics: dict[str, Any], metric_name: str) -> float:
    main_f1 = metrics["main_topic"]["macro_f1"]
    sub_f1 = metrics["subtopic_end_to_end"]["macro_f1"]
    if metric_name == "main_macro_f1":
        return float(main_f1)
    if metric_name == "mean_macro_f1":
        return 0.5 * (float(main_f1) + float(sub_f1))
    raise ValueError(f"Unsupported early_stopping_metric '{metric_name}'.")


def train_finetuned_minilm(
    train_config_path: Path | str = DEFAULT_TRAIN_CONFIG_PATH,
    *,
    encoder: torch.nn.Module | None = None,
    tokenizer: Any | None = None,
    output_dir_override: Path | str | None = None,
) -> dict[str, Any]:
    """Fine-tune HierarchicalVocabClassifier with early stopping on validation Macro F1."""
    tcfg = load_json(train_config_path)
    seed = int(tcfg.get("seed", 42))
    _set_seed(seed)

    model_cfg = ModelConfig.from_json(_resolve_path(tcfg.get("model_config_path", DEFAULT_MODEL_CONFIG_PATH)))
    taxonomy = load_taxonomy(_resolve_path(tcfg["taxonomy_path"]))

    if encoder is None or tokenizer is None:
        encoder, tokenizer = load_encoder_and_tokenizer(model_cfg.model_name)

    _freeze_bottom_encoder_layers(encoder, int(tcfg.get("freeze_bottom_layers", 0)))
    model = HierarchicalVocabClassifier.from_config(
        model_cfg,
        taxonomy_path=_resolve_path(tcfg["taxonomy_path"]),
        encoder=encoder,
    )

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)

    train_records = load_records(_resolve_path(tcfg["train_path"]))
    val_records = load_records(_resolve_path(tcfg["val_path"]))
    test_records = load_records(_resolve_path(tcfg["test_path"]))

    mask_untrusted = bool(tcfg.get("mask_untrusted_subtopics", True))
    train_ds = VocabSenseDataset(train_records, taxonomy, mask_untrusted_subtopics=mask_untrusted)
    val_ds = VocabSenseDataset(val_records, taxonomy, mask_untrusted_subtopics=False)
    test_ds = VocabSenseDataset(test_records, taxonomy, mask_untrusted_subtopics=False)

    max_len = int(tcfg.get("max_length", 128))
    collate_fn = _make_collate_fn(tokenizer, max_len)
    train_loader = DataLoader(
        train_ds,
        batch_size=int(tcfg.get("batch_size", 32)),
        shuffle=True,
        collate_fn=collate_fn,
    )
    eval_bs = int(tcfg.get("eval_batch_size", 64))
    val_loader = DataLoader(val_ds, batch_size=eval_bs, shuffle=False, collate_fn=collate_fn)
    test_loader = DataLoader(test_ds, batch_size=eval_bs, shuffle=False, collate_fn=collate_fn)

    alpha = float(tcfg.get("class_weight_alpha", 0.0))
    main_class_weights: torch.Tensor | None = None
    if alpha > 0.0:
        cw_dict = compute_power_class_weights(train_ds.main_labels, alpha=alpha)
        weights = [cw_dict.get(i, 1.0) for i in range(model_cfg.num_main_topics)]
        main_class_weights = torch.tensor(weights, dtype=torch.float32, device=device)

    encoder_params = [p for p in model.encoder.parameters() if p.requires_grad]
    head_params = [
        p
        for name, p in model.named_parameters()
        if p.requires_grad and not name.startswith("encoder.")
    ]
    optimizer = torch.optim.AdamW(
        [
            {"params": encoder_params, "lr": float(tcfg.get("encoder_lr", 3e-5))},
            {"params": head_params, "lr": float(tcfg.get("head_lr", 3e-4))},
        ],
        weight_decay=float(tcfg.get("weight_decay", 0.01)),
    )

    epochs = int(tcfg.get("epochs", 4))
    total_steps = max(1, len(train_loader) * epochs)
    scheduler = _build_linear_warmup_scheduler(
        optimizer,
        total_steps=total_steps,
        warmup_ratio=float(tcfg.get("warmup_ratio", 0.1)),
    )

    out_dir = Path(output_dir_override) if output_dir_override else _resolve_path(tcfg["output_dir"])
    best_ckpt_dir = out_dir / "best_model"
    out_dir.mkdir(parents=True, exist_ok=True)

    patience = int(tcfg.get("patience", 2))
    monitor_name = str(tcfg.get("early_stopping_metric", "mean_macro_f1"))
    teacher_forcing_prob = float(tcfg.get("teacher_forcing_prob", 0.5))
    max_grad_norm = float(tcfg.get("max_grad_norm", 1.0))

    best_score = -math.inf
    best_epoch = 0
    epochs_without_improve = 0
    history: list[dict[str, Any]] = []
    rng = random.Random(seed)
    t_start = time.perf_counter()

    for epoch in range(1, epochs + 1):
        model.train()
        ep_t0 = time.perf_counter()
        running_loss = 0.0
        steps = 0

        for batch in train_loader:
            optimizer.zero_grad()
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            main_y = batch["main_labels"].to(device)
            sub_y = batch["subtopic_labels"].to(device)

            use_tf = rng.random() < teacher_forcing_prob
            out = model(
                input_ids,
                attention_mask,
                main_labels=main_y,
                subtopic_labels=sub_y,
                main_class_weights=main_class_weights,
                teacher_forcing=use_tf,
            )
            loss = out["loss"]
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_grad_norm)
            optimizer.step()
            scheduler.step()

            running_loss += float(loss.item())
            steps += 1

        val_metrics, _ = evaluate_finetuned_model(model, val_loader, taxonomy, device=device)
        score = _get_monitor_score(val_metrics, monitor_name)
        ep_sec = round(time.perf_counter() - ep_t0, 2)

        epoch_log = {
            "epoch": epoch,
            "train_loss": round(running_loss / max(1, steps), 4),
            "val_main_acc": val_metrics["main_topic"]["accuracy"],
            "val_main_macro_f1": val_metrics["main_topic"]["macro_f1"],
            "val_sub_e2e_macro_f1": val_metrics["subtopic_end_to_end"]["macro_f1"],
            "val_sub_oracle_macro_f1": val_metrics["subtopic_oracle_main"]["macro_f1"],
            "val_joint_acc": val_metrics["joint_exact_match"],
            "monitor_score": round(score, 4),
            "seconds": ep_sec,
        }
        history.append(epoch_log)
        print(
            f"Epoch {epoch}/{epochs} | loss={epoch_log['train_loss']:.4f} | "
            f"val_main_f1={epoch_log['val_main_macro_f1']:.4f} | "
            f"val_sub_f1={epoch_log['val_sub_e2e_macro_f1']:.4f} | "
            f"val_joint={epoch_log['val_joint_acc']:.4f} ({ep_sec:.1f}s)"
        )

        if score > best_score:
            best_score = score
            best_epoch = epoch
            epochs_without_improve = 0
            model.save_checkpoint(best_ckpt_dir)
            tokenizer.save_pretrained(best_ckpt_dir)
        else:
            epochs_without_improve += 1
            if epochs_without_improve >= patience:
                print(f"Early stopping triggered at epoch {epoch} (best epoch={best_epoch}).")
                break

    # Restore best checkpoint for final evaluation on val, test, primary/secondary, and audited benchmark
    best_state = torch.load(best_ckpt_dir / "model_state.pt", map_location=device, weights_only=True)
    model.load_state_dict(best_state)

    val_metrics, _ = evaluate_finetuned_model(model, val_loader, taxonomy, device=device)
    test_metrics, test_preds = evaluate_finetuned_model(model, test_loader, taxonomy, device=device)

    primary_idx = [i for i, r in enumerate(test_records) if int(r.get("sense_index", 0)) == 0]
    secondary_idx = [i for i, r in enumerate(test_records) if int(r.get("sense_index", 0)) > 0]
    test_primary = (
        evaluate_hierarchical_predictions(
            y_main_true=[test_preds["y_main_true"][i] for i in primary_idx],
            y_main_pred=[test_preds["y_main_pred"][i] for i in primary_idx],
            y_sub_true=[test_preds["y_sub_true"][i] for i in primary_idx],
            y_sub_pred_e2e=[test_preds["y_sub_pred_e2e"][i] for i in primary_idx],
            y_sub_pred_oracle=[test_preds["y_sub_pred_oracle"][i] for i in primary_idx],
            taxonomy=taxonomy,
        )
        if primary_idx
        else None
    )
    test_secondary = (
        evaluate_hierarchical_predictions(
            y_main_true=[test_preds["y_main_true"][i] for i in secondary_idx],
            y_main_pred=[test_preds["y_main_pred"][i] for i in secondary_idx],
            y_sub_true=[test_preds["y_sub_true"][i] for i in secondary_idx],
            y_sub_pred_e2e=[test_preds["y_sub_pred_e2e"][i] for i in secondary_idx],
            y_sub_pred_oracle=[test_preds["y_sub_pred_oracle"][i] for i in secondary_idx],
            taxonomy=taxonomy,
        )
        if secondary_idx
        else None
    )

    bench_path = _resolve_path(tcfg.get("benchmark_test_path", ""))
    bench_metrics: dict[str, Any] | None = None
    if bench_path.exists() and bench_path.is_file():
        bench_records = load_records(bench_path)
        bench_ds = VocabSenseDataset(bench_records, taxonomy, mask_untrusted_subtopics=False)
        bench_loader = DataLoader(bench_ds, batch_size=eval_bs, shuffle=False, collate_fn=collate_fn)
        bench_metrics, _ = evaluate_finetuned_model(model, bench_loader, taxonomy, device=device)

    results = {
        "best_epoch": best_epoch,
        "best_val_monitor_score": round(best_score, 4),
        "total_train_seconds": round(time.perf_counter() - t_start, 2),
        "history": history,
        "val": val_metrics,
        "test": test_metrics,
        "test_primary_only": test_primary,
        "test_secondary_only": test_secondary,
        "benchmark_test": bench_metrics,
    }
    save_json(results, out_dir / "finetune_results.json")
    return results


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fine-tune Multi-task Hierarchical MiniLM.")
    parser.add_argument("--config", type=Path, default=DEFAULT_TRAIN_CONFIG_PATH)
    parser.add_argument("--output-dir", type=Path, default=None)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = parse_args(argv)
    results = train_finetuned_minilm(
        train_config_path=args.config,
        output_dir_override=args.output_dir,
    )
    t = results["test"]
    print(
        f"Fine-tuned MiniLM (best epoch {results['best_epoch']}) Test -> "
        f"Main Acc={t['main_topic']['accuracy']:.4f}, Main Macro F1={t['main_topic']['macro_f1']:.4f}, "
        f"Sub E2E Macro F1={t['subtopic_end_to_end']['macro_f1']:.4f}, Joint Acc={t['joint_exact_match']:.4f}"
    )


if __name__ == "__main__":
    main()
