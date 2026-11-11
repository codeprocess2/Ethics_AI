import logging
from typing import List, Optional
import numpy as np
from lime.lime_text import LimeTextExplainer
from model_loader import registry
from resume_parser import clean_resume
from schemas import ExplainFeatureWeight, ExplainResponse

logger = logging.getLogger(__name__)

class ExplanationService:
    def __init__(self):
        self._lime_explainer = None
        self._shap_explainer = None

    def get_lime_explainer(self) -> LimeTextExplainer:
        if self._lime_explainer is None:
            classes = list(registry.calibrated_svm.classes_)
            self._lime_explainer = LimeTextExplainer(
                class_names=classes,
                bow=True,
                random_state=42
            )
        return self._lime_explainer

    @staticmethod
    def _predict_probabilities(texts: List[str]) -> np.ndarray:
        """Predicts probability distributions matching Cell 15 of notebook."""
        cleaned = [clean_resume(t) for t in texts]
        vectors = registry.resume_tfidf.transform(cleaned)
        return registry.calibrated_svm.predict_proba(vectors)

    def explain_with_lime(
        self,
        raw_text: str,
        num_features: int = 8,
        target_category: Optional[str] = None
    ) -> ExplainResponse:
        """Generates LIME text explanation using calibrated SVM model."""
        cleaned = clean_resume(raw_text)
        probs = self._predict_probabilities([cleaned])[0]
        classes = list(registry.calibrated_svm.classes_)

        if target_category and target_category in classes:
            target_idx = classes.index(target_category)
        else:
            target_idx = int(np.argmax(probs))
            target_category = classes[target_idx]

        explainer = self.get_lime_explainer()
        exp = explainer.explain_instance(
            cleaned,
            self._predict_probabilities,
            labels=(target_idx,),
            num_features=num_features,
            num_samples=300
        )

        weights = exp.as_list(label=target_idx)
        feature_weights = [
            ExplainFeatureWeight(feature=str(word), weight=round(float(weight), 4))
            for word, weight in weights
        ]

        summary = (
            f"LIME identified top {len(feature_weights)} key terms contributing to the prediction "
            f"'{target_category}' with confidence {probs[target_idx]:.1%}."
        )

        return ExplainResponse(
            method="lime",
            target_category=target_category,
            predicted_probability=round(float(probs[target_idx]), 4),
            features=feature_weights,
            summary=summary
        )

    def explain_with_shap(
        self,
        raw_text: str,
        num_features: int = 8,
        target_category: Optional[str] = None
    ) -> ExplainResponse:
        """Generates SHAP explanation matching Cell 17/18 of notebook."""
        import shap
        cleaned = clean_resume(raw_text)
        probs = self._predict_probabilities([cleaned])[0]
        classes = list(registry.calibrated_svm.classes_)

        if target_category and target_category in classes:
            target_idx = classes.index(target_category)
        else:
            target_idx = int(np.argmax(probs))
            target_category = classes[target_idx]

        masker = shap.maskers.Text()
        explainer = shap.Explainer(self._predict_probabilities, masker)
        shap_values = explainer([cleaned], max_evals=100)

        tokens = shap_values.data[0]
        values = shap_values.values[0, :, target_idx]

        # Aggregate tokens and absolute contribution
        token_impacts = []
        for token, val in zip(tokens, values):
            token_clean = token.strip()
            if len(token_clean) > 1:
                token_impacts.append((token_clean, float(val)))

        # Sort by absolute impact
        token_impacts.sort(key=lambda x: abs(x[1]), reverse=True)
        top_tokens = token_impacts[:num_features]

        feature_weights = [
            ExplainFeatureWeight(feature=word, weight=round(weight, 4))
            for word, weight in top_tokens
        ]

        summary = (
            f"SHAP evaluated marginal contribution of tokens for category '{target_category}' "
            f"(predicted confidence {probs[target_idx]:.1%})."
        )

        return ExplainResponse(
            method="shap",
            target_category=target_category,
            predicted_probability=round(float(probs[target_idx]), 4),
            features=feature_weights,
            summary=summary
        )

    def explain(
        self,
        raw_text: str,
        method: str = "lime",
        num_features: int = 8,
        target_category: Optional[str] = None
    ) -> ExplainResponse:
        method_lower = method.lower().strip()
        if method_lower == "shap":
            return self.explain_with_shap(raw_text, num_features=num_features, target_category=target_category)
        else:
            return self.explain_with_lime(raw_text, num_features=num_features, target_category=target_category)

explanation_service = ExplanationService()

