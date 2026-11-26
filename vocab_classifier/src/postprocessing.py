"""Post-processing, hierarchy invariant verification, and API response builders."""

from __future__ import annotations

from typing import Any

from src.schemas import (
    ExpandedCandidateItem,
    MainCandidateItem,
    PredictionPair,
    PredictionResponse,
    ReviewRecordPayload,
    SubtopicCandidateItem,
    TopicScore,
)


class HierarchyConstraintError(ValueError):
    """Raised when a predicted subtopic does not belong to the predicted main topic."""


def enforce_hierarchy_invariant(
    *,
    main_topic_name: str,
    main_topic_id: str,
    subtopic_id: str,
    taxonomy: dict[str, Any],
) -> None:
    """Verify strictly that `subtopic_id` belongs to `main_topic_name` (`main_topic_id`)."""
    expected_main_name = taxonomy.get("valid_subtopics", {}).get(subtopic_id)
    expected_main_id = taxonomy.get("name_to_id", {}).get(expected_main_name, "")
    if expected_main_name != main_topic_name or expected_main_id != main_topic_id:
        raise HierarchyConstraintError(
            f"Hierarchy violation: subtopic '{subtopic_id}' belongs to "
            f"'{expected_main_id}' ('{expected_main_name}'), not '{main_topic_id}' ('{main_topic_name}')."
        )


def format_prediction_response(
    raw_pred: dict[str, Any],
    *,
    prepared_record: dict[str, Any],
    taxonomy: dict[str, Any],
    model_version: str = "1.0.0",
) -> PredictionResponse:
    """Validate hierarchy constraints and convert raw predictor output to API schema."""
    main_id = str(raw_pred["main_topic_id"])
    main_name = str(raw_pred["main_topic"])
    sub_id = str(raw_pred["subtopic_id"])
    sub_name = str(raw_pred["subtopic"])

    enforce_hierarchy_invariant(
        main_topic_name=main_name,
        main_topic_id=main_id,
        subtopic_id=sub_id,
        taxonomy=taxonomy,
    )

    valid_subtopics = taxonomy.get("valid_subtopics", {})
    subtopic_cands: list[SubtopicCandidateItem] = []
    for cand in raw_pred.get("top_k_subtopic_candidates", []):
        if valid_subtopics.get(cand["subtopic_id"]) != main_name:
            continue
        subtopic_cands.append(SubtopicCandidateItem(**cand))

    expanded_cands: list[ExpandedCandidateItem] = []
    for cand in raw_pred.get("top_k_expanded_candidates", []):
        if valid_subtopics.get(cand["subtopic_id"]) != cand["main_topic"]:
            continue
        expanded_cands.append(ExpandedCandidateItem(**cand))

    status = "needs_review" if raw_pred.get("abstained") else "accepted"
    review_record = ReviewRecordPayload(
        predicted_main_topic=main_id,
        predicted_subtopic=sub_id,
        human_verified=False,
        verified_main_topic=None,
        verified_subtopic=None,
        prediction_status=status,
        model_version=model_version,
    )

    return PredictionResponse(
        sense_id=prepared_record.get("sense_id"),
        word=prepared_record["word"],
        pos=prepared_record["pos"],
        prediction=PredictionPair(
            main_topic=TopicScore(
                id=main_id,
                name=main_name,
                confidence=float(raw_pred["main_topic_confidence"]),
            ),
            subtopic=TopicScore(
                id=sub_id,
                name=sub_name,
                confidence=float(raw_pred["subtopic_confidence"]),
            ),
        ),
        topic_type=raw_pred["topic_type"],
        joint_confidence=float(raw_pred["joint_confidence"]),
        status=status,
        abstained=bool(raw_pred["abstained"]),
        abstention_reasons=list(raw_pred.get("abstention_reasons", [])),
        top_k_main_candidates=[
            MainCandidateItem(**cand) for cand in raw_pred.get("top_k_main_candidates", [])
        ],
        top_k_subtopic_candidates=subtopic_cands,
        top_k_expanded_candidates=expanded_cands,
        review_record=review_record,
        validation_warnings=list(prepared_record.get("validation_warnings", [])),
        model_version=model_version,
    )
