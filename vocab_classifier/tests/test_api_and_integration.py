"""Integration tests for modular inference, FastAPI endpoints, and human review workflow."""

from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

from api.app import create_app
from src.data.common import DEFAULT_TAXONOMY_PATH, load_taxonomy
from src.inference.final_predictor import DEFAULT_FINAL_MODEL_DIR
from src.postprocessing import HierarchyConstraintError, enforce_hierarchy_invariant
from src.predictor import ModelArtifactNotFoundError, VocabClassifierService
from src.training.finalize_model import build_final_model_package
from tests.test_final_model import _DeterministicStubEncoder


class _MultiDomainStubTokenizer:
    """Deterministic stub tokenizer assigning distinct token IDs per domain keyword."""

    def __call__(
        self,
        texts: list[str],
        *,
        padding: bool = True,
        truncation: bool = True,
        max_length: int = 192,
        return_tensors: str = "pt",
    ) -> dict[str, object]:
        import torch

        ids = []
        for t in texts:
            if "habitat" in t or "forest" in t or "Climate" in t or "wildlife" in t:
                tok = 1
            elif "software" in t or "algorithm" in t or "programming" in t:
                tok = 2
            elif "university" in t or "books" in t or "reading" in t:
                tok = 3
            elif "however" in t or "contrast" in t:
                tok = 4
            else:
                tok = 5
            ids.append([tok, tok + 10, tok + 20])
        input_ids = torch.tensor(ids, dtype=torch.long)
        attention_mask = torch.ones_like(input_ids)
        return {"input_ids": input_ids, "attention_mask": attention_mask}


def _build_temp_final_model(
    tmp_path: Path,
    *,
    encoder: _DeterministicStubEncoder,
    tokenizer: _MultiDomainStubTokenizer,
) -> Path:
    samples = []
    for i in range(6):
        samples.append(
            {
                "sample_id": f"s_env_{i}",
                "word_id": f"w_env_{i}",
                "word": f"habitat{i}",
                "sense_index": 0,
                "pos": "noun",
                "definition": f"Natural forest ecosystem habitat conservation {i}.",
                "examples": [f"Protecting wildlife habitat{i} preserves biodiversity."],
                "collocations": ["natural habitat", "wildlife conservation"],
                "main_topic": "Environment & Nature",
                "main_topic_id": "env",
                "subtopic": "Biodiversity & Wildlife Conservation" if i % 2 == 0 else "Climate Change & Emissions",
                "subtopic_id": "env.wildlife" if i % 2 == 0 else "env.climate",
                "topic_type": "topical",
                "subtopic_confidence": 0.9,
                "subtopic_trusted": True,
            }
        )
        samples.append(
            {
                "sample_id": f"s_tech_{i}",
                "word_id": f"w_tech_{i}",
                "word": f"algorithm{i}",
                "sense_index": 0,
                "pos": "noun",
                "definition": f"Software module, API code library and neural programming routine {i}.",
                "examples": [f"Developers import the algorithm{i} software library in Python."],
                "collocations": ["software library", "neural algorithm"],
                "main_topic": "Science & Technology",
                "main_topic_id": "tech",
                "subtopic": "Artificial Intelligence & Automation" if i % 2 == 0 else "Digital Media & Consumer Tech",
                "subtopic_id": "tech.ai" if i % 2 == 0 else "tech.digital",
                "topic_type": "topical",
                "subtopic_confidence": 0.9,
                "subtopic_trusted": True,
            }
        )
        samples.append(
            {
                "sample_id": f"s_edu_{i}",
                "word_id": f"w_edu_{i}",
                "word": f"reading{i}",
                "sense_index": 0,
                "pos": "noun",
                "definition": f"Academic building where students borrow printed books and study {i}.",
                "examples": [f"Students study at the university reading{i} room and borrow books."],
                "collocations": ["borrow books", "university study"],
                "main_topic": "Education & Academia",
                "main_topic_id": "edu",
                "subtopic": "University & Higher Education",
                "subtopic_id": "edu.university",
                "topic_type": "topical",
                "subtopic_confidence": 0.9,
                "subtopic_trusted": True,
            }
        )
        samples.append(
            {
                "sample_id": f"s_gen_{i}",
                "word_id": f"w_gen_{i}",
                "word": f"however{i}",
                "sense_index": 0,
                "pos": "adverb",
                "definition": f"Used to contrast one statement with another {i}.",
                "examples": [f"She worked hard; however{i}, it rained."],
                "collocations": [],
                "main_topic": "General Vocabulary",
                "main_topic_id": "gen",
                "subtopic": "Linking & Discourse",
                "subtopic_id": "gen.linking",
                "topic_type": "general",
                "subtopic_confidence": 0.9,
                "subtopic_trusted": True,
            }
        )

    for split_name, prefix in (("train.jsonl", "tr"), ("val.jsonl", "va"), ("test.jsonl", "te")):
        recs = [{**r, "word_id": f"{prefix}_{r['word_id']}"} for r in samples]
        (tmp_path / split_name).write_text(
            "\n".join(json.dumps(r) for r in recs) + "\n",
            encoding="utf-8",
        )

    cfg = tmp_path / "baseline_config.json"
    cfg.write_text(
        json.dumps(
            {
                "seed": 42,
                "train_path": str(tmp_path / "train.jsonl"),
                "val_path": str(tmp_path / "val.jsonl"),
                "test_path": str(tmp_path / "test.jsonl"),
                "taxonomy_path": str(DEFAULT_TAXONOMY_PATH),
                "minilm": {"model_name": "stub", "max_length": 32, "batch_size": 8},
            }
        ),
        encoding="utf-8",
    )
    out_dir = tmp_path / "final_model"
    build_final_model_package(
        baseline_config_path=cfg,
        output_dir=out_dir,
        save_local_encoder=False,
        encoder=encoder,
        tokenizer=tokenizer,
    )
    return out_dir


class TestVocabClassifierIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls._tmp = tempfile.TemporaryDirectory()
        cls.tmp_path = Path(cls._tmp.name)
        cls.enc = _DeterministicStubEncoder()
        cls.tok = _MultiDomainStubTokenizer()
        cls.model_dir = _build_temp_final_model(cls.tmp_path, encoder=cls.enc, tokenizer=cls.tok)

    @classmethod
    def tearDownClass(cls) -> None:
        cls._tmp.cleanup()

    def _make_stub_client(
        self,
        *,
        allow_missing_definition: bool = False,
        review_db_name: str = "review.db",
    ) -> TestClient:
        app = create_app(
            model_dir=self.model_dir,
            allow_missing_definition=allow_missing_definition,
            review_db_path=self.tmp_path / review_db_name,
            preload=False,
        )
        # Inject deterministic stub encoder/tokenizer into predictor
        from src.data.common import load_json
        from src.inference.final_predictor import ProductionVocabPredictor
        from src.preprocessing import InputValidationPolicy
        import joblib

        sub_index = load_json(self.model_dir / "subtopic_classifiers" / "index.json")
        pred = ProductionVocabPredictor(
            encoder=self.enc,
            tokenizer=self.tok,
            main_clf=joblib.load(self.model_dir / "main_classifier" / "model.joblib"),
            sub_clfs={
                int(k): joblib.load(self.model_dir / "subtopic_classifiers" / v)
                for k, v in sub_index["by_main_label_id"].items()
            },
            taxonomy=load_taxonomy(self.model_dir / "config" / "taxonomy.json"),
            preprocessing_cfg=load_json(self.model_dir / "config" / "preprocessing.json"),
            inference_cfg=load_json(self.model_dir / "config" / "inference.json"),
            temperatures=load_json(self.model_dir / "calibration" / "temperatures.json"),
        )
        app.state.classifier_state.service = VocabClassifierService(
            predictor=pred,
            model_dir=self.model_dir,
            model_version="1.0.0",
            validation_policy=InputValidationPolicy(
                allow_missing_definition=allow_missing_definition
            ),
        )
        return TestClient(app)

    def test_valid_single_sense_and_model_info(self) -> None:
        client = self._make_stub_client()
        health = client.get("/health")
        self.assertEqual(health.status_code, 200)
        self.assertTrue(health.json()["model_loaded"])

        info = client.get("/model-info")
        self.assertEqual(info.status_code, 200)
        self.assertEqual(info.json()["model_version"], "1.0.0")
        self.assertEqual(info.json()["taxonomy_summary"]["main_topics_count"], 11)

        res = client.post(
            "/predict",
            json={
                "word": "biodiversity",
                "pos": "n.",
                "definition": "Natural forest ecosystem habitat conservation.",
                "examples": ["Protecting wildlife habitat preserves ecosystem biodiversity."],
                "collocations": ["natural habitat", "wildlife conservation"],
            },
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["pos"], "noun")
        self.assertEqual(data["prediction"]["main_topic"]["id"], "env")
        self.assertTrue(data["prediction"]["subtopic"]["id"].startswith("env."))
        self.assertEqual(data["review_record"]["predicted_main_topic"], "env")
        self.assertFalse(data["review_record"]["human_verified"])

    def test_batch_and_polysemous_senses_classified_independently(self) -> None:
        client = self._make_stub_client()
        sense_place = {
            "sense_id": "lib_place",
            "word": "library",
            "pos": "n.",
            "definition": "Academic building where students borrow printed books and study.",
            "examples": ["Students borrow books at the university reading room."],
            "collocations": ["borrow books", "university study"],
        }
        sense_code = {
            "sense_id": "lib_code",
            "word": "library",
            "pos": "n.",
            "definition": "Software module, API code collection and programming routine.",
            "examples": ["Developers import the software library in Python."],
            "collocations": ["software library", "neural algorithm"],
        }

        fwd = client.post("/predict/batch", json={"items": [sense_place, sense_code]})
        rev = client.post("/predict/batch", json={"items": [sense_code, sense_place]})
        self.assertEqual(fwd.status_code, 200)
        self.assertEqual(rev.status_code, 200)

        fwd_preds = fwd.json()["predictions"]
        rev_preds = rev.json()["predictions"]
        self.assertEqual(len(fwd_preds), 2)
        self.assertEqual(fwd_preds[0]["prediction"]["main_topic"]["id"], "edu")
        self.assertEqual(fwd_preds[1]["prediction"]["main_topic"]["id"], "tech")
        # Order independence proves sense 0 never leaks into or alters sense 1
        self.assertEqual(fwd_preds[0]["prediction"], rev_preds[1]["prediction"])
        self.assertEqual(fwd_preds[1]["prediction"], rev_preds[0]["prediction"])

    def test_missing_definition_policy_and_empty_inputs(self) -> None:
        strict_client = self._make_stub_client(allow_missing_definition=False)
        # Missing definition rejected under default strict policy
        r_missing_def = strict_client.post("/predict", json={"word": "forest", "pos": "noun"})
        self.assertEqual(r_missing_def.status_code, 422)
        self.assertIn("definition", r_missing_def.text.lower())

        # Empty inputs rejected cleanly
        self.assertEqual(strict_client.post("/predict", json={"word": "   ", "definition": "x"}).status_code, 422)
        self.assertEqual(strict_client.post("/predict", json={}).status_code, 422)
        self.assertEqual(strict_client.post("/predict/batch", json={"items": []}).status_code, 422)

        # Permissive policy accepts missing definition when context exists
        fallback_client = self._make_stub_client(allow_missing_definition=True)
        r_ok = fallback_client.post(
            "/predict",
            json={
                "word": "habitat",
                "pos": "noun",
                "collocations": ["natural habitat", "wildlife conservation"],
            },
        )
        self.assertEqual(r_ok.status_code, 200)
        self.assertIn("missing_definition_fallback", r_ok.json()["validation_warnings"])

    def test_hierarchy_invariant_and_low_confidence_abstention(self) -> None:
        taxonomy = load_taxonomy(DEFAULT_TAXONOMY_PATH)
        with self.assertRaises(HierarchyConstraintError):
            enforce_hierarchy_invariant(
                main_topic_name="Environment & Nature",
                main_topic_id="env",
                subtopic_id="tech.ai",
                taxonomy=taxonomy,
            )

        client = self._make_stub_client()
        service = client.app.state.classifier_state.service
        low_conf = service.predict_one(
            {
                "word": "habitat",
                "pos": "noun",
                "definition": "Natural forest ecosystem habitat conservation.",
            },
            main_threshold=1.01,
            joint_threshold=1.01,
        )
        self.assertEqual(low_conf.status, "needs_review")
        self.assertTrue(low_conf.abstained)
        self.assertEqual(low_conf.review_record.prediction_status, "needs_review")

    def test_missing_artifact_error_and_reload_consistency(self) -> None:
        missing_dir = self.tmp_path / "does_not_exist"
        with self.assertRaises(ModelArtifactNotFoundError):
            VocabClassifierService.from_dir(missing_dir)

        degraded_app = create_app(model_dir=missing_dir, preload=True)
        degraded_client = TestClient(degraded_app)
        h = degraded_client.get("/health").json()
        self.assertEqual(h["status"], "degraded")
        self.assertFalse(h["model_loaded"])
        self.assertIn("release_artifact restore", h["error"])

        r_pred = degraded_client.post(
            "/predict",
            json={"word": "biodiversity", "definition": "Variety of life."},
        )
        self.assertEqual(r_pred.status_code, 503)

        # Reload determinism
        c1 = self._make_stub_client()
        c2 = self._make_stub_client()
        sample = {"word": "habitat", "pos": "noun", "definition": "Natural forest ecosystem."}
        self.assertEqual(
            c1.post("/predict", json=sample).json()["prediction"],
            c2.post("/predict", json=sample).json()["prediction"],
        )

    def test_human_review_workflow_preserves_original_prediction(self) -> None:
        client = self._make_stub_client(review_db_name="workflow_integration.db")
        # Import two senses; temporarily raise threshold on one via service override or check review persistence
        imp = client.post(
            "/review/import",
            json={
                "items": [
                    {
                        "sense_id": "card_1",
                        "word": "biodiversity",
                        "pos": "noun",
                        "definition": "Natural forest ecosystem habitat conservation.",
                        "examples": ["Protecting wildlife habitat preserves ecosystem biodiversity."],
                    },
                    {
                        "sense_id": "card_2",
                        "word": "algorithm",
                        "pos": "noun",
                        "definition": "Software module and neural programming routine.",
                        "examples": ["Developers import the software library."],
                    },
                ]
            },
        )
        self.assertEqual(imp.status_code, 200)
        items = imp.json()["items"]
        self.assertEqual(len(items), 2)
        first = items[0]
        orig_main = first["predicted_main_topic"]
        orig_sub = first["predicted_subtopic"]

        # Human overrides subtopic without losing original model predictions
        ver = client.post(
            f"/review/{first['record_id']}/verify",
            json={
                "verified_subtopic_id": "env.pollution",
                "reviewer": "annotator_01",
                "notes": "Reclassified during human audit",
            },
        )
        self.assertEqual(ver.status_code, 200)
        updated = ver.json()
        self.assertTrue(updated["human_verified"])
        self.assertEqual(updated["predicted_main_topic"], orig_main)
        self.assertEqual(updated["predicted_subtopic"], orig_sub)
        self.assertEqual(updated["verified_main_topic"], "env")
        self.assertEqual(updated["verified_subtopic"], "env.pollution")
        self.assertEqual(updated["active_subtopic"], "env.pollution")

        hist = client.get(f"/review/{first['record_id']}/history").json()
        self.assertEqual([h["action"] for h in hist], ["auto_classified", "human_corrected"])

        exported = client.get("/review/export?include_unverified_accepted=false").json()
        self.assertEqual(len(exported), 1)
        self.assertEqual(exported[0]["record_id"], first["record_id"])

    def test_real_final_model_reload_and_polysemy_if_available(self) -> None:
        if not (DEFAULT_FINAL_MODEL_DIR / "main_classifier" / "model.joblib").exists():
            self.skipTest("final_model artifacts not present locally")

        app = create_app(
            model_dir=DEFAULT_FINAL_MODEL_DIR,
            review_db_path=self.tmp_path / "real_review.db",
            preload=True,
        )
        client = TestClient(app)
        self.assertTrue(client.get("/health").json()["model_loaded"])
        info = client.get("/model-info").json()
        self.assertEqual(info["dataset_version"], "1.2.0")
        self.assertEqual(info["taxonomy_version"], "1.1.0")
        self.assertEqual(info["taxonomy_summary"]["main_topics_count"], 11)
        self.assertEqual(info["taxonomy_summary"]["subtopics_count"], 45)

        res = client.post(
            "/predict/batch",
            json={
                "items": [
                    {
                        "sense_id": "lib_books",
                        "word": "library",
                        "pos": "n.",
                        "definition": "A building or room containing collections of books and journals for people to read or borrow.",
                        "examples": ["She spent all afternoon studying in the university library."],
                        "collocations": ["borrow from a library", "public library"],
                    },
                    {
                        "sense_id": "lib_soft",
                        "word": "library",
                        "pos": "n.",
                        "definition": "A collection of precompiled software routines, functions, or modules that a program can use.",
                        "examples": ["Install the machine learning Python library before running inference."],
                        "collocations": ["open-source library", "standard software library"],
                    },
                ]
            },
        )
        rev = client.post(
            "/predict/batch",
            json={
                "items": [
                    {
                        "sense_id": "lib_soft",
                        "word": "library",
                        "pos": "n.",
                        "definition": "A collection of precompiled software routines, functions, or modules that a program can use.",
                        "examples": ["Install the machine learning Python library before running inference."],
                        "collocations": ["open-source library", "standard software library"],
                    },
                    {
                        "sense_id": "lib_books",
                        "word": "library",
                        "pos": "n.",
                        "definition": "A building or room containing collections of books and journals for people to read or borrow.",
                        "examples": ["She spent all afternoon studying in the university library."],
                        "collocations": ["borrow from a library", "public library"],
                    },
                ]
            },
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(rev.status_code, 200)
        preds = res.json()["predictions"]
        rev_preds = rev.json()["predictions"]
        self.assertEqual(len(preds), 2)
        # First sense ("library" as university study building) is confidently accepted under edu.university
        self.assertEqual(preds[0]["prediction"]["main_topic"]["id"], "edu")
        self.assertEqual(preds[0]["prediction"]["subtopic"]["id"], "edu.university")
        # Both senses produce distinct predictions & reversing batch order yields identical per-sense results
        self.assertNotEqual(
            preds[0]["prediction"]["main_topic"]["id"],
            preds[1]["prediction"]["main_topic"]["id"],
        )
        self.assertEqual(preds[0]["prediction"], rev_preds[1]["prediction"])
        self.assertEqual(preds[1]["prediction"], rev_preds[0]["prediction"])


if __name__ == "__main__":
    unittest.main()
