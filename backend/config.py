import os
from pathlib import Path
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict

# Base directory for backend/
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent

def resolve_path(relative_name: str) -> str:
    """Finds path whether in backend directory, project root, or custom env."""
    # 1. Custom ENV if provided
    env_val = os.getenv(relative_name.upper())
    if env_val and os.path.exists(env_val):
        return env_val
    # 2. Inside backend/
    backend_candidate = BACKEND_DIR / relative_name
    if backend_candidate.exists():
        return str(backend_candidate)
    # 3. Inside project root/
    root_candidate = PROJECT_ROOT / relative_name
    if root_candidate.exists():
        return str(root_candidate)
    # Default fallback
    return str(root_candidate)

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Ethics Resume Screening & Bias Detection System"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = ""
    
    # Path to artifacts directory (auto-resolves either ./artifacts or ../artifacts)
    ARTIFACTS_DIR: str = resolve_path("artifacts")
    
    # Dataset path for bias audit (auto-resolves either ./resumes_dataset.jsonl or ../resumes_dataset.jsonl)
    DATASET_PATH: str = resolve_path("resumes_dataset.jsonl")
    
    # Allowed CORS origins (can be list or comma-separated string)
    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://ethics-ai.vercel.app",
        "https://fairhire.vercel.app",
        "https://fair-hire.vercel.app",
        "*"
    ]
    
    # Regex to match any Vercel preview or production deployment domain or localhost
    CORS_ORIGIN_REGEX: str = r"https://.*\.vercel\.app|https?://localhost:\d+|https?://127\.0\.0\.1:\d+"
    
    def get_cors_origins(self) -> List[str]:
        raw = self.CORS_ORIGINS
        if isinstance(raw, list):
            return raw
        if isinstance(raw, str):
            clean = raw.strip()
            if not clean or clean == "*":
                return ["*"]
            return [x.strip() for x in clean.split(",") if x.strip()]
        return ["*"]
    
    # Maximum file upload size in bytes (e.g. 5MB)
    MAX_UPLOAD_SIZE_BYTES: int = 5 * 1024 * 1024
    
    # Decision thresholds matching notebook (verdict function)
    SHORTLIST_THRESHOLD: float = 0.55
    REJECT_THRESHOLD: float = 0.45
    
    model_config = SettingsConfigDict(
        env_file=str(BACKEND_DIR / ".env"),
        extra="ignore"
    )

settings = Settings()


