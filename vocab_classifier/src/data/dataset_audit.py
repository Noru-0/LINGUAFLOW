"""Stage 1 Dataset Audit: audit gen.* labels, flag secondary-sense conflicts, and build clean benchmark."""

from __future__ import annotations

import argparse
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from src.data.common import (
    DEFAULT_FINAL_LABELED_PATH,
    DEFAULT_TAXONOMY_PATH,
    PROCESSED_DIR,
    load_records,
    load_taxonomy,
    save_json,
    save_jsonl,
)
from src.data.subtopic_labeling import (
    ZeroShotSubtopicScorer,
    _format_sense_meaning_query,
    build_subtopic_catalog,
    create_zero_shot_scorer,
)

DEFAULT_AUDIT_REPORT_PATH = PROCESSED_DIR / "audit_report.json"
DEFAULT_AUDIT_QUEUE_PATH = PROCESSED_DIR / "audit_queue.jsonl"


def audit_records(
    records: list[dict[str, Any]],
    taxonomy: dict[str, Any],
    scorer: ZeroShotSubtopicScorer,
    *,
    secondary_conflict_margin: float = 0.08,
    min_trusted_subtopic_margin: float = 0.03,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], dict[str, Any]]:
    """Audit secondary senses and gen.* labels, annotating trust flags and review queue."""
    _, all_subtopics = build_subtopic_catalog(taxonomy)
    queries = [_format_sense_meaning_query(r) for r in records]
    raw_scores = scorer.raw_score_batch(queries, all_subtopics)

    sub_main = [c["main_topic"] for c in all_subtopics]
    indices_by_main: dict[str, list[int]] = defaultdict(list)
    for idx, m_name in enumerate(sub_main):
        indices_by_main[m_name].append(idx)

    audited: list[dict[str, Any]] = []
    review_queue: list[dict[str, Any]] = []

    secondary_total = 0
    secondary_conflicts = 0
    gen_total = 0
    gen_flagged_pos_mismatch = 0
    gen_flagged_domain_override = 0
    trusted_subtopic_count = 0

    for rec, row in zip(records, raw_scores):
        item = dict(rec)
        assigned_main = item.get("main_topic")
        sense_idx = int(item.get("sense_index", 0))
        sub_id = item.get("subtopic_id")
        sub_margin = float(item.get("confidence_margin", 0.0))

        # Best score within assigned main_topic vs best overall main_topic
        assigned_indices = indices_by_main.get(assigned_main, [])
        assigned_best = max((row[i] for i in assigned_indices), default=0.0)
        best_overall_idx = max(range(len(row)), key=lambda i: row[i])
        best_overall_score = row[best_overall_idx]
        best_overall_main = sub_main[best_overall_idx]
        conflict_delta = round(best_overall_score - assigned_best, 4)

        is_secondary_conflict = (
            sense_idx > 0
            and assigned_main != best_overall_main
            and conflict_delta >= secondary_conflict_margin
        )
        if sense_idx > 0:
            secondary_total += 1
            if is_secondary_conflict:
                secondary_conflicts += 1

        # Audit gen.* assignments
        gen_audit_flag: str | None = None
        if item.get("main_topic_id") == "gen":
            gen_total += 1
            src = str(item.get("source_topic") or "")
            pos = str(item.get("pos") or "")
            if sub_id == "gen.function" and pos in {"noun", "verb", "adjective"}:
                gen_audit_flag = "open_class_in_gen_function"
                gen_flagged_pos_mismatch += 1
            elif src not in {"daily", "thinking", "emotion", "media", ""}:
                gen_audit_flag = "domain_source_overridden_to_gen"
                gen_flagged_domain_override += 1

        is_trusted_subtopic = (
            not is_secondary_conflict
            and sub_margin >= min_trusted_subtopic_margin
            and gen_audit_flag is None
        )
        if is_trusted_subtopic:
            trusted_subtopic_count += 1

        item["secondary_conflict"] = is_secondary_conflict
        item["suggested_main_topic"] = best_overall_main if is_secondary_conflict else None
        item["gen_audit_flag"] = gen_audit_flag
        item["is_trusted_subtopic"] = is_trusted_subtopic
        audited.append(item)

        if is_secondary_conflict or gen_audit_flag is not None or sub_margin < min_trusted_subtopic_margin:
            reason = (
                "secondary_conflict"
                if is_secondary_conflict
                else (gen_audit_flag or "low_subtopic_margin")
            )
            review_queue.append(
                {
                    **item,
                    "audit_priority_reason": reason,
                    "conflict_delta": conflict_delta,
                }
            )

    review_queue.sort(key=lambda r: (-int(r["secondary_conflict"]), -r["conflict_delta"], r.get("confidence_margin", 0.0)))

    report = {
        "total_audited": len(audited),
        "secondary_senses_total": secondary_total,
        "secondary_sense_conflicts": secondary_conflicts,
        "secondary_conflict_rate": round(secondary_conflicts / secondary_total, 4) if secondary_total else 0.0,
        "gen_total": gen_total,
        "gen_by_subtopic": dict(
            sorted(Counter(r["subtopic_id"] for r in audited if r.get("main_topic_id") == "gen").items())
        ),
        "gen_flagged_open_class_in_function": gen_flagged_pos_mismatch,
        "gen_flagged_domain_override": gen_flagged_domain_override,
        "trusted_subtopic_count": trusted_subtopic_count,
        "untrusted_subtopic_count": len(audited) - trusted_subtopic_count,
        "review_queue_count": len(review_queue),
    }
    return audited, review_queue, report


def run_dataset_audit(
    *,
    final_path: Path | str = DEFAULT_FINAL_LABELED_PATH,
    val_path: Path | str = PROCESSED_DIR / "val.jsonl",
    test_path: Path | str = PROCESSED_DIR / "test.jsonl",
    train_path: Path | str = PROCESSED_DIR / "train.jsonl",
    taxonomy_path: Path | str = DEFAULT_TAXONOMY_PATH,
    output_dir: Path | str = PROCESSED_DIR,
    backend: str = "auto",
) -> dict[str, Any]:
    """Audit splits, annotate trust flags in-place, and write gold-audited benchmark splits."""
    taxonomy = load_taxonomy(taxonomy_path)
    scorer = create_zero_shot_scorer(backend=backend)
    out_dir = Path(output_dir)

    all_reports: dict[str, Any] = {}
    full_review_queue: list[dict[str, Any]] = []

    for split_name, path in (("train", train_path), ("val", val_path), ("test", test_path)):
        p = Path(path)
        if not p.exists():
            continue
        recs = load_records(p)
        audited, queue, report = audit_records(recs, taxonomy, scorer)
        save_jsonl(audited, p)
        all_reports[split_name] = report
        if split_name in {"val", "test"}:
            clean_bench = [
                r
                for r in audited
                if not r["secondary_conflict"] and r["gen_audit_flag"] is None
            ]
            save_jsonl(clean_bench, out_dir / f"benchmark_{split_name}.jsonl")
            report["benchmark_clean_count"] = len(clean_bench)
        full_review_queue.extend(queue)

    if Path(final_path).exists():
        final_recs = load_records(final_path)
        audited_final, _, final_rep = audit_records(final_recs, taxonomy, scorer)
        save_jsonl(audited_final, final_path)
        all_reports["final_labeled"] = final_rep

    save_jsonl(full_review_queue, out_dir / DEFAULT_AUDIT_QUEUE_PATH.name)
    save_json(all_reports, out_dir / DEFAULT_AUDIT_REPORT_PATH.name)
    return all_reports


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Audit Stage 1 dataset quality and build benchmark.")
    parser.add_argument("--backend", choices=("auto", "embedding", "nli", "lexical"), default="auto")
    parser.add_argument("--output-dir", type=Path, default=PROCESSED_DIR)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = parse_args(argv)
    reports = run_dataset_audit(output_dir=args.output_dir, backend=args.backend)
    for split_name, rep in reports.items():
        print(
            f"[{split_name}] total={rep['total_audited']} | "
            f"sec_conflicts={rep['secondary_sense_conflicts']}/{rep['secondary_senses_total']} | "
            f"trusted_sub={rep['trusted_subtopic_count']}"
        )


if __name__ == "__main__":
    main()
