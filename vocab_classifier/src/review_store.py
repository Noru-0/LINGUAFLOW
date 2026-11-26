"""SQLite-backed Human Review Workflow persistence for vocab_classifier."""

from __future__ import annotations

import json
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from src.data.common import PACKAGE_ROOT
from src.schemas import PredictionResponse, ReviewHistoryEntry, ReviewQueueItem

DEFAULT_REVIEW_DB_PATH = PACKAGE_ROOT / "data" / "processed" / "review_workflow.db"


class ReviewWorkflowStore:
    """Stores auto-classified and human-verified vocabulary labels without losing original predictions."""

    def __init__(self, db_path: Path | str = DEFAULT_REVIEW_DB_PATH) -> None:
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_schema()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        return conn

    def _init_schema(self) -> None:
        with self._connect() as conn:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS vocabulary_classifications (
                    record_id TEXT PRIMARY KEY,
                    sense_id TEXT,
                    word TEXT NOT NULL,
                    pos TEXT NOT NULL,
                    definition TEXT NOT NULL,
                    examples_json TEXT NOT NULL DEFAULT '[]',
                    collocations_json TEXT NOT NULL DEFAULT '[]',
                    predicted_main_topic TEXT NOT NULL,
                    predicted_subtopic TEXT NOT NULL,
                    predicted_joint_confidence REAL NOT NULL,
                    prediction_status TEXT NOT NULL,
                    human_verified INTEGER NOT NULL DEFAULT 0,
                    verified_main_topic TEXT,
                    verified_subtopic TEXT,
                    model_version TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );

                CREATE INDEX IF NOT EXISTS idx_vc_status_verified
                    ON vocabulary_classifications(prediction_status, human_verified);

                CREATE TABLE IF NOT EXISTS classification_review_history (
                    id TEXT PRIMARY KEY,
                    record_id TEXT NOT NULL,
                    action TEXT NOT NULL,
                    previous_subtopic TEXT,
                    new_subtopic TEXT NOT NULL,
                    actor TEXT NOT NULL,
                    notes TEXT,
                    created_at TEXT NOT NULL,
                    FOREIGN KEY (record_id) REFERENCES vocabulary_classifications(record_id) ON DELETE CASCADE
                );
                """
            )

    @staticmethod
    def _row_to_item(row: sqlite3.Row) -> ReviewQueueItem:
        human_verified = bool(row["human_verified"])
        verified_main = row["verified_main_topic"]
        verified_sub = row["verified_subtopic"]
        return ReviewQueueItem(
            record_id=row["record_id"],
            sense_id=row["sense_id"],
            word=row["word"],
            pos=row["pos"],
            definition=row["definition"],
            predicted_main_topic=row["predicted_main_topic"],
            predicted_subtopic=row["predicted_subtopic"],
            predicted_joint_confidence=float(row["predicted_joint_confidence"]),
            prediction_status=row["prediction_status"],
            human_verified=human_verified,
            verified_main_topic=verified_main,
            verified_subtopic=verified_sub,
            active_main_topic=verified_main if (human_verified and verified_main) else row["predicted_main_topic"],
            active_subtopic=verified_sub if (human_verified and verified_sub) else row["predicted_subtopic"],
            model_version=row["model_version"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )

    def import_batch(
        self,
        records: list[dict[str, Any]],
        predictions: list[PredictionResponse],
    ) -> list[ReviewQueueItem]:
        """Persist imported senses + predictions; keep original prediction immutable."""
        now = datetime.now(timezone.utc).isoformat()
        created: list[ReviewQueueItem] = []
        with self._connect() as conn:
            for rec, pred in zip(records, predictions):
                record_id = f"rev_{uuid.uuid4().hex[:12]}"
                hist_id = f"hist_{uuid.uuid4().hex[:12]}"
                conn.execute(
                    """
                    INSERT INTO vocabulary_classifications (
                        record_id, sense_id, word, pos, definition,
                        examples_json, collocations_json,
                        predicted_main_topic, predicted_subtopic, predicted_joint_confidence,
                        prediction_status, human_verified, verified_main_topic, verified_subtopic,
                        model_version, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, NULL, ?, ?, ?)
                    """,
                    (
                        record_id,
                        rec.get("sense_id"),
                        pred.word,
                        pred.pos,
                        rec["definition"],
                        json.dumps(rec.get("examples", []), ensure_ascii=False),
                        json.dumps(rec.get("collocations", []), ensure_ascii=False),
                        pred.review_record.predicted_main_topic,
                        pred.review_record.predicted_subtopic,
                        float(pred.joint_confidence),
                        pred.status,
                        pred.model_version,
                        now,
                        now,
                    ),
                )
                conn.execute(
                    """
                    INSERT INTO classification_review_history (
                        id, record_id, action, previous_subtopic, new_subtopic, actor, notes, created_at
                    ) VALUES (?, ?, 'auto_classified', NULL, ?, ?, ?, ?)
                    """,
                    (
                        hist_id,
                        record_id,
                        pred.review_record.predicted_subtopic,
                        f"model:{pred.model_version}",
                        f"status={pred.status}, joint_conf={pred.joint_confidence:.4f}",
                        now,
                    ),
                )
                row = conn.execute(
                    "SELECT * FROM vocabulary_classifications WHERE record_id = ?",
                    (record_id,),
                ).fetchone()
                created.append(self._row_to_item(row))
        return created

    def list_queue(
        self,
        *,
        status: str | None = "needs_review",
        only_unverified: bool = True,
        limit: int = 100,
    ) -> list[ReviewQueueItem]:
        """List imported senses filtered by `prediction_status` and verification flag."""
        clauses: list[str] = []
        params: list[Any] = []
        if status and status != "all":
            clauses.append("prediction_status = ?")
            params.append(status)
        if only_unverified:
            clauses.append("human_verified = 0")
        where_sql = f"WHERE {' AND '.join(clauses)}" if clauses else ""
        sql = f"SELECT * FROM vocabulary_classifications {where_sql} ORDER BY created_at DESC LIMIT ?"
        params.append(int(limit))
        with self._connect() as conn:
            rows = conn.execute(sql, params).fetchall()
            return [self._row_to_item(r) for r in rows]

    def verify_record(
        self,
        record_id: str,
        *,
        verified_subtopic_id: str,
        taxonomy: dict[str, Any],
        verified_main_topic_id: str | None = None,
        reviewer: str = "human_reviewer",
        notes: str | None = None,
    ) -> ReviewQueueItem:
        """Record human verification or correction without overwriting predicted_* columns."""
        valid_subtopics = taxonomy.get("valid_subtopics", {})
        name_to_id = taxonomy.get("name_to_id", {})
        expected_main_name = valid_subtopics.get(verified_subtopic_id)
        if not expected_main_name:
            raise ValueError(f"Unknown verified_subtopic_id '{verified_subtopic_id}'.")
        canonical_main_id = name_to_id[expected_main_name]
        if verified_main_topic_id and verified_main_topic_id != canonical_main_id:
            raise ValueError(
                f"Subtopic '{verified_subtopic_id}' belongs to '{canonical_main_id}', "
                f"not '{verified_main_topic_id}'."
            )

        now = datetime.now(timezone.utc).isoformat()
        with self._connect() as conn:
            existing = conn.execute(
                "SELECT * FROM vocabulary_classifications WHERE record_id = ?",
                (record_id,),
            ).fetchone()
            if existing is None:
                raise KeyError(f"Review record '{record_id}' not found.")

            prev_active = (
                existing["verified_subtopic"]
                if (existing["human_verified"] and existing["verified_subtopic"])
                else existing["predicted_subtopic"]
            )
            action = (
                "human_verified"
                if verified_subtopic_id == existing["predicted_subtopic"]
                else "human_corrected"
            )
            conn.execute(
                """
                UPDATE vocabulary_classifications
                SET human_verified = 1,
                    verified_main_topic = ?,
                    verified_subtopic = ?,
                    updated_at = ?
                WHERE record_id = ?
                """,
                (canonical_main_id, verified_subtopic_id, now, record_id),
            )
            conn.execute(
                """
                INSERT INTO classification_review_history (
                    id, record_id, action, previous_subtopic, new_subtopic, actor, notes, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    f"hist_{uuid.uuid4().hex[:12]}",
                    record_id,
                    action,
                    prev_active,
                    verified_subtopic_id,
                    reviewer,
                    notes,
                    now,
                ),
            )
            updated = conn.execute(
                "SELECT * FROM vocabulary_classifications WHERE record_id = ?",
                (record_id,),
            ).fetchone()
            return self._row_to_item(updated)

    def get_history(self, record_id: str) -> list[ReviewHistoryEntry]:
        """Return chronological audit trail for a classified vocabulary sense."""
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT * FROM classification_review_history WHERE record_id = ? ORDER BY created_at ASC",
                (record_id,),
            ).fetchall()
            return [
                ReviewHistoryEntry(
                    id=r["id"],
                    record_id=r["record_id"],
                    action=r["action"],
                    previous_subtopic=r["previous_subtopic"],
                    new_subtopic=r["new_subtopic"],
                    actor=r["actor"],
                    notes=r["notes"],
                    created_at=r["created_at"],
                )
                for r in rows
            ]

    def export_records(self, *, include_unverified_accepted: bool = True) -> list[ReviewQueueItem]:
        """Export finalized dataset records (human-verified plus optionally auto-accepted)."""
        with self._connect() as conn:
            if include_unverified_accepted:
                rows = conn.execute(
                    """
                    SELECT * FROM vocabulary_classifications
                    WHERE human_verified = 1 OR prediction_status = 'accepted'
                    ORDER BY created_at ASC
                    """
                ).fetchall()
            else:
                rows = conn.execute(
                    """
                    SELECT * FROM vocabulary_classifications
                    WHERE human_verified = 1
                    ORDER BY created_at ASC
                    """
                ).fetchall()
            return [self._row_to_item(r) for r in rows]
