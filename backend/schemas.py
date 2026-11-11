from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# Health Schema
class HealthResponse(BaseModel):
    status: str = Field(..., json_schema_extra={"example": "healthy"})
    message: str = Field(..., json_schema_extra={"example": "All models and artifacts loaded successfully"})
    artifacts_status: Dict[str, bool]
    model_metadata: Dict[str, Any]

# Category Confidence item
class CategoryScore(BaseModel):
    category: str
    probability: float

# Resume Prediction Schema
class PredictResponse(BaseModel):
    filename: Optional[str] = None
    character_count: int
    cleaned_character_count: int
    predicted_category: str
    confidence: float
    top_categories: List[CategoryScore]
    cleaned_text_preview: str

# Screen Request (when sending text directly or with name)
class ScreenRequest(BaseModel):
    resume_text: str = Field(..., min_length=10, description="Raw or formatted resume text")
    applicant_name: str = Field(default="Michael Smith", description="Applicant name for Model A")
    counterfactual_name: Optional[str] = Field(
        default="Jennifer Smith",
        description="Optional second name to perform instant counterfactual test"
    )

class ModelDecision(BaseModel):
    score: float
    percentage: str
    verdict: str  # Shortlist, Reject, Human review needed

class CounterfactualComparison(BaseModel):
    name_a: str
    decision_a: ModelDecision
    name_b: str
    decision_b: ModelDecision
    bias_detected: bool
    explanation: str

class ScreenResponse(BaseModel):
    applicant_name: str
    model_a_biased: ModelDecision
    model_b_fair: ModelDecision
    counterfactual: Optional[CounterfactualComparison] = None
    note: str

# Bias Audit Schema
class BiasAuditGroupMetric(BaseModel):
    group: str
    model_a_shortlist_rate: float
    model_b_shortlist_rate: float

class TopNameInfluence(BaseModel):
    word: str
    coefficient: float
    impact: str  # "SHORTLIST" or "REJECT"

class BiasAuditResponse(BaseModel):
    sample_size: int
    evaluation_criteria: str
    metrics: List[BiasAuditGroupMetric]
    model_a_gap: float
    model_b_gap: float
    disparate_impact_ratio_model_a: float
    disparate_impact_ratio_model_b: float
    top_name_influences: List[TopNameInfluence]
    audit_summary: str

# Explainability Schema
class ExplainFeatureWeight(BaseModel):
    feature: str
    weight: float

class ExplainRequest(BaseModel):
    resume_text: str = Field(..., min_length=10)
    method: str = Field(default="lime", pattern="^(lime|shap)$")
    num_features: int = Field(default=8, ge=1, le=20)
    target_category: Optional[str] = None

class ExplainResponse(BaseModel):
    method: str
    target_category: str
    predicted_probability: float
    features: List[ExplainFeatureWeight]
    summary: str
