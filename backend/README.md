# AI Ethics Resume Screening & Bias Detection Backend

A modular FastAPI backend integrating machine learning models for resume classification, biased vs. name-blind screening, counterfactual bias auditing, and model explainability (LIME/SHAP).

---

## Architecture & Modules

```
├── main.py              # FastAPI app definition, CORS, lifespan startup, endpoints
├── model_loader.py      # Artifact registry loading ML models and vectorizers once on startup
├── resume_parser.py     # PDF (PyMuPDF), DOCX (python-docx), and TXT text extraction + exact clean_resume()
├── prediction.py        # Classification inference, Model A/B hiring scoring, and counterfactual verdicts
├── fairness.py          # Benchmark bias audit, disparate impact calculation, and name coefficient influence
├── explainability.py    # LIME and SHAP token-level attribution service
├── schemas.py           # Pydantic v2 schemas for request validation and response models
├── config.py            # Environment settings and CORS configuration
├── test_api.py          # Pytest automated test suite covering all endpoints and edge cases
├── requirements.txt     # Python package dependencies
├── .env.example         # Environment variables template
└── artifacts/           # Trained models and vectorizers from AI_ETHICS_updated.ipynb
```

---

## Machine Learning Components & Artifacts

| Component | Artifact | Details |
|---|---|---|
| **Resume Classifier** | `artifacts/resume_classifier.pkl` | Tuned Linear SVM trained on 36 categories |
| **Category Vectorizer** | `artifacts/resume_tfidf.pkl` | TfidfVectorizer (10,000 max features, n-grams 1-2) |
| **Calibrated Classifier** | `artifacts/calibrated_svm.pkl` | CalibratedClassifierCV for smooth probability scores |
| **Model A (Biased)** | `artifacts/model_a_biased.pkl` | Logistic Regression (Text TF-IDF + Name features) |
| **Model A Text Vectorizer**| `artifacts/model_a_tfidf.pkl` | TfidfVectorizer (4,000 features, min_df=2) |
| **Model A Name Vectorizer**| `artifacts/model_a_name_vectorizer.pkl` | CountVectorizer (binary=True, 28 names) |
| **Model B (Fair)** | `artifacts/model_b_fair.pkl` | Logistic Regression (Text TF-IDF only, name-blind) |
| **Model Metadata** | `artifacts/model_metadata.json` | Model names, feature sets, and training metadata |

---

## API Endpoints

### 1. `GET /health`
Returns backend status and verifies all model artifacts are loaded.
- **Response:** `{ "status": "healthy", "artifacts_status": {...}, "model_metadata": {...} }`

### 2. `POST /predict`
Uploads a resume file (`.pdf`, `.docx`, `.txt`) and returns the predicted job category with confidence and top-K rankings.
- **Form Data:** `file` (multipart/form-data), `top_k` (query parameter, default 5)

### 3. `POST /screen`
Screens a candidate against **Model A (Biased)** and **Model B (Fair)**.
- **Parameters:** `resume_text` (or `file`), `applicant_name`, `counterfactual_name`
- **Output:** Comparison of hiring scores, verdict (`Shortlist`, `Reject`, `Human review needed`), and counterfactual bias detection.

### 4. `POST /bias-audit`
Runs the evaluation audit across held-out, equally qualified resumes with paired male/female names.
- **Output:** Male vs. Female shortlist rates, disparate impact ratio, demographic gap, and top name coefficients pushing towards shortlist/reject.

### 5. `POST /explain`
Explains the resume classification decision using LIME or SHAP.
- **Body:** `{ "resume_text": "...", "method": "lime", "num_features": 8 }`
- **Output:** Feature attribution weights for contributing words.

---

## Getting Started

### 1. Installation
Ensure Python 3.10+ is installed:
```bash
pip install -r requirements.txt
```

### 2. Start the Server
```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 3. Interactive Documentation
- **Swagger UI:** `http://127.0.0.1:8000/docs`
- **ReDoc:** `http://127.0.0.1:8000/redoc`

### 4. Run Automated Tests
```bash
pytest test_api.py -v
```
All 11 unit and integration tests verify document extraction, invalid uploads, Model A/B inference, counterfactual checks, and LIME explanations.
