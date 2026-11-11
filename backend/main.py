import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from model_loader import registry
from resume_parser import parse_resume_upload, clean_resume
from prediction import predict_category, screen_resume
from fairness import run_bias_audit
from explainability import explanation_service
from schemas import (
    HealthResponse,
    PredictResponse,
    ScreenRequest,
    ScreenResponse,
    BiasAuditResponse,
    ExplainRequest,
    ExplainResponse
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ai_ethics_api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model artifacts at startup
    logger.info("Initializing application and loading ML artifacts...")
    try:
        registry.load_artifacts()
        logger.info("ML artifacts loaded successfully.")
    except Exception as e:
        logger.error(f"Startup warning - failed to load artifacts: {e}")
    yield
    logger.info("Shutting down application...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Backend API for AI Ethics Resume Screening, Mitigated Hiring, "
        "Counterfactual Bias Auditing, and Explainability (LIME/SHAP)."
    ),
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get(
    "/health",
    response_model=HealthResponse,
    summary="Health and artifact verification",
    tags=["System"]
)
def get_health():
    """Verifies backend operation and the loaded state of all model artifacts."""
    status_dict = registry.get_status()
    all_loaded = all(status_dict.values())
    return HealthResponse(
        status="healthy" if all_loaded else "degraded",
        message="All models and artifacts loaded successfully." if all_loaded else "Some artifacts could not be loaded.",
        artifacts_status=status_dict,
        model_metadata=registry.metadata
    )

@app.post(
    "/predict",
    response_model=PredictResponse,
    summary="Predict resume category from document upload",
    tags=["Resume Classification"]
)
async def predict_resume_endpoint(
    file: UploadFile = File(..., description="Resume file in PDF, DOCX, or TXT format"),
    top_k: int = Query(5, ge=1, le=10, description="Number of top categories to return")
):
    """
    Upload a resume (PDF/DOCX/TXT) to predict its professional category using the Tuned Linear SVM.
    Returns category confidence and top ranking categories.
    """
    raw_text = await parse_resume_upload(file)
    try:
        result = predict_category(raw_text=raw_text, filename=file.filename, top_k=top_k)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post(
    "/screen",
    response_model=ScreenResponse,
    summary="Screen resume with Model A (Biased) and Model B (Fair)",
    tags=["Hiring Screening"]
)
async def screen_resume_endpoint(
    request: Request,
    file: Optional[UploadFile] = File(None, description="Optional resume document file"),
    resume_text: Optional[str] = Form(None, description="Optional raw resume text if no file uploaded"),
    applicant_name: str = Form("Michael Smith", description="Applicant name for Model A"),
    counterfactual_name: Optional[str] = Form("Jennifer Smith", description="Name for counterfactual test")
):
    """
    Evaluates a candidate using both:
    1. **Model A (Biased):** Uses resume TF-IDF and applicant name features.
    2. **Model B (Name-Blind):** Uses resume TF-IDF only (fair mitigation model).
    
    Also executes counterfactual name-swap testing to explicitly detect name-based discrimination.
    Supports JSON body (ScreenRequest) or multipart/form-data.
    """
    text = ""
    app_name = applicant_name
    cf_name = counterfactual_name

    content_type = request.headers.get("content-type", "").lower()

    if "application/json" in content_type:
        try:
            body = await request.json()
            json_req = ScreenRequest(**body)
            text = json_req.resume_text
            app_name = json_req.applicant_name
            cf_name = json_req.counterfactual_name
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Invalid JSON request body: {str(e)}")
    elif file is not None and file.filename:
        text = await parse_resume_upload(file)
    elif resume_text is not None and resume_text.strip():
        text = resume_text
    else:
        raise HTTPException(
            status_code=400,
            detail="Must provide either a file upload (.pdf, .docx, .txt) or resume_text."
        )

    try:
        response = screen_resume(
            raw_text=text,
            applicant_name=app_name,
            counterfactual_name=cf_name
        )
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Screening failed")
        raise HTTPException(status_code=500, detail=f"Screening error: {str(e)}")

@app.post(
    "/bias-audit",
    response_model=BiasAuditResponse,
    summary="Run ethical fairness audit and disparity metrics",
    tags=["Bias Audit & Fairness"]
)
def bias_audit_endpoint():
    """
    Audits Model A and Model B against held-out qualified resumes under paired counterfactual testing.
    Computes shortlist rates, disparate impact ratio, demographic gap, and top discriminatory name tokens.
    """
    try:
        return run_bias_audit()
    except Exception as e:
        logger.exception("Bias audit failed")
        raise HTTPException(status_code=500, detail=f"Bias audit error: {str(e)}")

@app.post(
    "/explain",
    response_model=ExplainResponse,
    summary="Generate LIME or SHAP feature explainability",
    tags=["Explainability"]
)
def explain_endpoint(request: ExplainRequest):
    """
    Provides LIME or SHAP token-level attribution for the resume classifier.
    Highlights tokens that most influenced the classification outcome.
    """
    try:
        return explanation_service.explain(
            raw_text=request.resume_text,
            method=request.method,
            num_features=request.num_features,
            target_category=request.target_category
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Explainability service failed")
        raise HTTPException(status_code=500, detail=f"Explainability error: {str(e)}")

