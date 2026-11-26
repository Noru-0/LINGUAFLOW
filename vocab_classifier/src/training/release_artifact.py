"""Immutable release packaging, SHA-256 verification, and restore CLI for vocab_classifier."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import tempfile
import urllib.request
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from src.data.common import PACKAGE_ROOT, load_json, save_json
from src.inference.final_predictor import DEFAULT_FINAL_MODEL_DIR

DEFAULT_RELEASES_DIR = PACKAGE_ROOT / "releases"
DEFAULT_RELEASE_REPO = "Noru-0/LINGUAFLOW"


def compute_sha256(path: Path) -> str:
    """Compute hex SHA-256 checksum for a file."""
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def _validate_final_model_dir(model_dir: Path) -> list[Path]:
    """Validate that required model binaries and configs exist and return sorted file list."""
    required_paths = [
        model_dir / "README.md",
        model_dir / "main_classifier" / "model.joblib",
        model_dir / "subtopic_classifiers" / "index.json",
        model_dir / "calibration" / "temperatures.json",
        model_dir / "config" / "taxonomy.json",
        model_dir / "config" / "preprocessing.json",
        model_dir / "config" / "inference.json",
        model_dir / "evaluation" / "test_metrics.json",
        model_dir / "evaluation" / "classification_report.json",
        model_dir / "evaluation" / "confusion_matrix.json",
    ]
    missing = [str(p) for p in required_paths if not p.exists()]
    if missing:
        raise FileNotFoundError(
            "Final model directory is incomplete; missing required files:\n  - "
            + "\n  - ".join(missing)
        )

    sub_index = load_json(model_dir / "subtopic_classifiers" / "index.json")
    for rel_file in sub_index.get("by_main_label_id", {}).values():
        sub_path = model_dir / "subtopic_classifiers" / rel_file
        if not sub_path.exists():
            raise FileNotFoundError(f"Missing subtopic classifier binary: {sub_path}")

    enc_dir = model_dir / "encoder" / "all-MiniLM-L6-v2"
    if not enc_dir.exists() or not any(enc_dir.iterdir()):
        raise FileNotFoundError(
            f"Missing local encoder weights directory: {enc_dir}. "
            "Run `python -m src.training.finalize_model` or restore from release artifact."
        )

    return sorted(p for p in model_dir.rglob("*") if p.is_file())


def package_release_artifact(
    *,
    model_dir: Path | str = DEFAULT_FINAL_MODEL_DIR,
    releases_dir: Path | str = DEFAULT_RELEASES_DIR,
    version: str = "1.0.0",
    repo_slug: str = DEFAULT_RELEASE_REPO,
    overwrite: bool = False,
) -> dict[str, Any]:
    """Package `final_model/` into an immutable versioned `.zip` with SHA-256 and manifest."""
    root = Path(model_dir)
    out_dir = Path(releases_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    artifact_tag = version if version.startswith("vocab-classifier-v") else f"vocab-classifier-v{version}"
    clean_version = artifact_tag.replace("vocab-classifier-v", "", 1)

    archive_path = out_dir / f"{artifact_tag}.zip"
    sha_path = out_dir / f"{artifact_tag}.zip.sha256"
    manifest_path = out_dir / f"{artifact_tag}.manifest.json"

    if not overwrite and (archive_path.exists() or manifest_path.exists()):
        raise FileExistsError(
            f"Immutable release artifact '{artifact_tag}' already exists in {out_dir}. "
            "Bump the version instead of overwriting an already-published release."
        )

    files = _validate_final_model_dir(root)
    pre_cfg = load_json(root / "config" / "preprocessing.json")
    inf_cfg = load_json(root / "config" / "inference.json")
    temps = load_json(root / "calibration" / "temperatures.json")
    data_integrity = pre_cfg.get("data_integrity", {})

    with zipfile.ZipFile(archive_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for file_path in files:
            rel = file_path.relative_to(root).as_posix()
            zf.write(file_path, arcname=rel)

    archive_sha256 = compute_sha256(archive_path)
    sha_path.write_text(f"{archive_sha256}  {archive_path.name}\n", encoding="utf-8")

    file_entries = [
        {
            "path": f.relative_to(root).as_posix(),
            "size_bytes": f.stat().st_size,
            "sha256": compute_sha256(f),
        }
        for f in files
    ]

    manifest = {
        "artifact_tag": artifact_tag,
        "model_version": clean_version,
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "immutable": True,
        "dataset_version": data_integrity.get("dataset_version", "1.2.0"),
        "taxonomy_version": data_integrity.get("taxonomy_version", "1.1.0"),
        "encoder": pre_cfg.get("encoder", {}).get("model_name", "sentence-transformers/all-MiniLM-L6-v2"),
        "classifier": pre_cfg.get("training_hyperparameters", {}).get("classifier", "LogisticRegression"),
        "weighting": pre_cfg.get("training_hyperparameters", {}).get("class_weight", "power_0.25"),
        "calibration": {
            "method": "temperature_scaling",
            "main_temperature": temps.get("main_temperature"),
            "subtopic_temperature": temps.get("subtopic_temperature"),
        },
        "inference": {
            "default_mode": inf_cfg.get("default_prediction_mode"),
            "top_k_main": inf_cfg.get("top_k_main"),
            "top_k_subtopic": inf_cfg.get("top_k_subtopic"),
            "main_confidence_threshold": inf_cfg.get("main_confidence_threshold"),
            "joint_confidence_threshold": inf_cfg.get("joint_confidence_threshold"),
        },
        "archive": {
            "filename": archive_path.name,
            "size_bytes": archive_path.stat().st_size,
            "sha256": archive_sha256,
            "download_url": f"https://github.com/{repo_slug}/releases/download/{artifact_tag}/{archive_path.name}",
            "checksum_url": f"https://github.com/{repo_slug}/releases/download/{artifact_tag}/{sha_path.name}",
        },
        "files": file_entries,
    }
    save_json(manifest, manifest_path)
    return {
        "artifact_tag": artifact_tag,
        "archive_path": str(archive_path),
        "sha256_path": str(sha_path),
        "manifest_path": str(manifest_path),
        "archive_sha256": archive_sha256,
        "archive_size_bytes": archive_path.stat().st_size,
        "file_count": len(file_entries),
    }


def _read_expected_sha256(
    archive_path: Path,
    *,
    expected_sha256: str | None = None,
    sha256_file: Path | None = None,
    manifest_path: Path | None = None,
) -> str | None:
    if expected_sha256:
        return expected_sha256.strip().lower()
    if manifest_path and manifest_path.exists():
        manifest = load_json(manifest_path)
        sha = manifest.get("archive", {}).get("sha256")
        if sha:
            return str(sha).strip().lower()
    candidate_sha = sha256_file or Path(f"{archive_path}.sha256")
    if candidate_sha.exists():
        first_token = candidate_sha.read_text(encoding="utf-8").strip().split()[0]
        return first_token.lower()
    return None


def verify_archive_checksum(
    archive_path: Path | str,
    *,
    expected_sha256: str | None = None,
    sha256_file: Path | str | None = None,
    manifest_path: Path | str | None = None,
) -> str:
    """Verify archive SHA-256 against an explicit digest, `.sha256` file, or manifest."""
    target = Path(archive_path)
    if not target.exists():
        raise FileNotFoundError(f"Release archive not found: {target}")
    expected = _read_expected_sha256(
        target,
        expected_sha256=expected_sha256,
        sha256_file=Path(sha256_file) if sha256_file else None,
        manifest_path=Path(manifest_path) if manifest_path else None,
    )
    actual = compute_sha256(target)
    if expected and actual.lower() != expected.lower():
        raise ValueError(
            f"SHA-256 verification failed for {target.name}: expected {expected}, got {actual}"
        )
    return actual


def restore_release_artifact(
    source: str | Path,
    *,
    target_dir: Path | str = DEFAULT_FINAL_MODEL_DIR,
    expected_sha256: str | None = None,
    sha256_file: Path | str | None = None,
    manifest_path: Path | str | None = None,
    overwrite: bool = False,
) -> dict[str, Any]:
    """Restore `final_model/` from a local zip or HTTP(S) release URL after checksum verification."""
    dest = Path(target_dir)
    if dest.exists() and any(dest.iterdir()) and not overwrite:
        raise FileExistsError(
            f"Target model directory '{dest}' already exists and is non-empty. "
            "Pass --overwrite to replace local weights."
        )

    source_str = str(source)
    downloaded_tmp: Path | None = None
    try:
        if source_str.startswith(("http://", "https://")):
            fd, tmp_name = tempfile.mkstemp(suffix=".zip", prefix="vocab_classifier_")
            os.close(fd)
            downloaded_tmp = Path(tmp_name)
            urllib.request.urlretrieve(source_str, downloaded_tmp)
            archive_path = downloaded_tmp
        else:
            archive_path = Path(source_str)

        actual_sha = verify_archive_checksum(
            archive_path,
            expected_sha256=expected_sha256,
            sha256_file=sha256_file,
            manifest_path=manifest_path,
        )

        staging_dir = dest.parent / f".restore_{dest.name}_tmp"
        if staging_dir.exists():
            shutil.rmtree(staging_dir)
        staging_dir.mkdir(parents=True, exist_ok=True)
        resolved_staging = staging_dir.resolve()

        with zipfile.ZipFile(archive_path, "r") as zf:
            for member in zf.infolist():
                member_path = (staging_dir / member.filename).resolve()
                if resolved_staging not in member_path.parents and member_path != resolved_staging:
                    raise ValueError(f"Unsafe zip member path detected: {member.filename}")
            zf.extractall(staging_dir)

        extracted_files = _validate_final_model_dir(staging_dir)
        if dest.exists():
            shutil.rmtree(dest)
        staging_dir.rename(dest)

        return {
            "restored_dir": str(dest),
            "archive_sha256": actual_sha,
            "restored_files": len(extracted_files),
        }
    finally:
        if downloaded_tmp and downloaded_tmp.exists():
            downloaded_tmp.unlink()


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Package, verify, or restore vocab-classifier release artifacts.")
    sub = parser.add_subparsers(dest="command", required=True)

    pkg = sub.add_parser("package", help="Build versioned release zip, SHA-256, and manifest.")
    pkg.add_argument("--version", default="1.0.0")
    pkg.add_argument("--model-dir", type=Path, default=DEFAULT_FINAL_MODEL_DIR)
    pkg.add_argument("--releases-dir", type=Path, default=DEFAULT_RELEASES_DIR)
    pkg.add_argument("--repo", default=DEFAULT_RELEASE_REPO)
    pkg.add_argument("--overwrite", action="store_true")

    ver = sub.add_parser("verify", help="Verify release zip checksum.")
    ver.add_argument("archive", type=Path)
    ver.add_argument("--sha256", default=None)
    ver.add_argument("--sha256-file", type=Path, default=None)
    ver.add_argument("--manifest", type=Path, default=None)

    res = sub.add_parser("restore", help="Restore final_model/ from release zip or URL.")
    res.add_argument("source", help="Path to zip archive or HTTP(S) download URL.")
    res.add_argument("--target-dir", type=Path, default=DEFAULT_FINAL_MODEL_DIR)
    res.add_argument("--sha256", default=None)
    res.add_argument("--sha256-file", type=Path, default=None)
    res.add_argument("--manifest", type=Path, default=None)
    res.add_argument("--overwrite", action="store_true")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    args = parse_args(argv)
    if args.command == "package":
        info = package_release_artifact(
            model_dir=args.model_dir,
            releases_dir=args.releases_dir,
            version=args.version,
            repo_slug=args.repo,
            overwrite=args.overwrite,
        )
        print(json.dumps(info, indent=2))
    elif args.command == "verify":
        digest = verify_archive_checksum(
            args.archive,
            expected_sha256=args.sha256,
            sha256_file=args.sha256_file,
            manifest_path=args.manifest,
        )
        print(json.dumps({"archive": str(args.archive), "sha256": digest, "verified": True}, indent=2))
    elif args.command == "restore":
        info = restore_release_artifact(
            args.source,
            target_dir=args.target_dir,
            expected_sha256=args.sha256,
            sha256_file=args.sha256_file,
            manifest_path=args.manifest,
            overwrite=args.overwrite,
        )
        print(json.dumps(info, indent=2))


if __name__ == "__main__":
    main()
