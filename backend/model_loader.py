import os
import json
import logging
import joblib
from typing import Dict, Any, Optional
from config import settings

logger = logging.getLogger(__name__)

class ModelRegistry:
    def __init__(self, artifacts_dir: str = settings.ARTIFACTS_DIR):
        self.artifacts_dir = artifacts_dir
        self.resume_classifier = None
        self.resume_tfidf = None
        self.calibrated_svm = None
        self.model_a = None
        self.model_b = None
        self.model_a_tfidf = None
        self.model_a_name_vectorizer = None
        self.metadata: Dict[str, Any] = {}
        self.loaded: bool = False
        self.load_errors: Dict[str, str] = {}

    def load_artifacts(self) -> None:
        """Loads all ML models, vectorizers, and metadata from the artifacts folder."""
        required_files = {
            "resume_classifier": "resume_classifier.pkl",
            "resume_tfidf": "resume_tfidf.pkl",
            "calibrated_svm": "calibrated_svm.pkl",
            "model_a": "model_a_biased.pkl",
            "model_b": "model_b_fair.pkl",
            "model_a_tfidf": "model_a_tfidf.pkl",
            "model_a_name_vectorizer": "model_a_name_vectorizer.pkl",
            "metadata": "model_metadata.json"
        }

        # Check existing files
        for key, fname in required_files.items():
            path = os.path.join(self.artifacts_dir, fname)
            if not os.path.exists(path):
                msg = f"Missing artifact file: {fname} at {path}"
                logger.error(msg)
                self.load_errors[key] = msg

        if self.load_errors:
            raise FileNotFoundError(f"Missing required artifact files: {self.load_errors}")

        try:
            self.resume_classifier = joblib.load(os.path.join(self.artifacts_dir, "resume_classifier.pkl"))
            self.resume_tfidf = joblib.load(os.path.join(self.artifacts_dir, "resume_tfidf.pkl"))
            self.calibrated_svm = joblib.load(os.path.join(self.artifacts_dir, "calibrated_svm.pkl"))
            self.model_a = joblib.load(os.path.join(self.artifacts_dir, "model_a_biased.pkl"))
            self.model_b = joblib.load(os.path.join(self.artifacts_dir, "model_b_fair.pkl"))
            self.model_a_tfidf = joblib.load(os.path.join(self.artifacts_dir, "model_a_tfidf.pkl"))
            self.model_a_name_vectorizer = joblib.load(os.path.join(self.artifacts_dir, "model_a_name_vectorizer.pkl"))

            with open(os.path.join(self.artifacts_dir, "model_metadata.json"), "r", encoding="utf-8") as f:
                self.metadata = json.load(f)

            self.loaded = True
            logger.info("All model artifacts and vectorizers loaded successfully.")
        except Exception as e:
            logger.exception("Failed to load model artifacts")
            self.loaded = False
            raise RuntimeError(f"Error loading artifacts: {str(e)}") from e

    def get_status(self) -> Dict[str, bool]:
        return {
            "resume_classifier": self.resume_classifier is not None,
            "resume_tfidf": self.resume_tfidf is not None,
            "calibrated_svm": self.calibrated_svm is not None,
            "model_a_biased": self.model_a is not None,
            "model_b_fair": self.model_b is not None,
            "model_a_tfidf": self.model_a_tfidf is not None,
            "model_a_name_vectorizer": self.model_a_name_vectorizer is not None,
            "metadata": bool(self.metadata)
        }

# Global singleton model registry
registry = ModelRegistry()

