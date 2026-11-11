from typing import List, Tuple, Dict, Any
import numpy as np
from scipy.sparse import hstack
from model_loader import registry
from resume_parser import clean_resume
from schemas import CategoryScore, PredictResponse, ModelDecision, CounterfactualComparison, ScreenResponse
from config import settings

def get_verdict(p: float) -> str:
    """Exact verdict thresholds from Cell 24 of notebook."""
    if p >= settings.SHORTLIST_THRESHOLD:
        return "Shortlist"
    elif p <= settings.REJECT_THRESHOLD:
        return "Reject"
    else:
        return "Human review needed"

def predict_category(raw_text: str, filename: str = None, top_k: int = 5) -> PredictResponse:
    """Predicts resume category using the tuned Linear SVM and calibrated probabilities."""
    cleaned = clean_resume(raw_text)
    if not cleaned:
        raise ValueError("Resume contains no valid text after cleaning.")

    vector = registry.resume_tfidf.transform([cleaned])
    
    # Use calibrated SVM for confident calibrated probabilities across all categories
    probs = registry.calibrated_svm.predict_proba(vector)[0]
    classes = registry.calibrated_svm.classes_

    # Argmax category
    pred_idx = int(np.argmax(probs))
    predicted_category = str(classes[pred_idx])
    confidence = float(probs[pred_idx])

    # Top-K categories
    sorted_indices = np.argsort(probs)[::-1][:top_k]
    top_categories = [
        CategoryScore(category=str(classes[idx]), probability=round(float(probs[idx]), 4))
        for idx in sorted_indices
    ]

    preview = cleaned[:200] + ("..." if len(cleaned) > 200 else "")

    return PredictResponse(
        filename=filename,
        character_count=len(raw_text),
        cleaned_character_count=len(cleaned),
        predicted_category=predicted_category,
        confidence=round(confidence, 4),
        top_categories=top_categories,
        cleaned_text_preview=preview
    )

def score_model_a(clean_text: str, applicant_name: str) -> float:
    """Calculates Model A (Biased) hiring probability score."""
    text_vec = registry.model_a_tfidf.transform([clean_text])
    name_vec = registry.model_a_name_vectorizer.transform([applicant_name])
    features = hstack([text_vec, name_vec]).tocsr()
    prob = registry.model_a.predict_proba(features)[0, 1]
    return float(prob)

def score_model_b(clean_text: str) -> float:
    """Calculates Model B (Fair / Name-Blind) hiring probability score."""
    text_vec = registry.model_a_tfidf.transform([clean_text])
    prob = registry.model_b.predict_proba(text_vec)[0, 1]
    return float(prob)

def screen_resume(
    raw_text: str,
    applicant_name: str = "Michael Smith",
    counterfactual_name: str = None
) -> ScreenResponse:
    """Runs Model A and Model B on the resume, optionally running a counterfactual test."""
    cleaned = clean_resume(raw_text)
    if not cleaned:
        raise ValueError("Resume contains no valid text after cleaning.")

    score_a = score_model_a(cleaned, applicant_name)
    score_b = score_model_b(cleaned)

    dec_a = ModelDecision(
        score=round(score_a, 4),
        percentage=f"{score_a:.0%}",
        verdict=get_verdict(score_a)
    )
    dec_b = ModelDecision(
        score=round(score_b, 4),
        percentage=f"{score_b:.0%}",
        verdict=get_verdict(score_b)
    )

    counterfactual = None
    if counterfactual_name and counterfactual_name.strip():
        cf_score = score_model_a(cleaned, counterfactual_name)
        cf_decision = ModelDecision(
            score=round(cf_score, 4),
            percentage=f"{cf_score:.0%}",
            verdict=get_verdict(cf_score)
        )
        bias_detected = (dec_a.verdict != cf_decision.verdict)
        explanation = (
            "BIAS DETECTED: The hiring verdict changed when ONLY the applicant name changed."
            if bias_detected
            else "No verdict shift detected between the two tested names for this specific resume profile."
        )
        counterfactual = CounterfactualComparison(
            name_a=applicant_name,
            decision_a=dec_a,
            name_b=counterfactual_name,
            decision_b=cf_decision,
            bias_detected=bias_detected,
            explanation=explanation
        )

    return ScreenResponse(
        applicant_name=applicant_name,
        model_a_biased=dec_a,
        model_b_fair=dec_b,
        counterfactual=counterfactual,
        note="Model A considers applicant name and resume features; Model B is name-blind and evaluates resume features only."
    )

