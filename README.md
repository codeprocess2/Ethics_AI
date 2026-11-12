# AI Ethics Resume Screening & Bias Detection

This project builds and demonstrates an ethical AI hiring workflow for resume screening and bias auditing. It compares a biased model against a fairer, name-blind alternative and exposes the decision logic through explainability tools.

## Project overview

The application is designed to:

- classify resumes into job categories
- compare screening outcomes with and without applicant-name features
- detect counterfactual bias using name swaps
- compute fairness metrics such as disparate impact
- explain model decisions using LIME and SHAP
- provide a browser-based dashboard for review and comparison

## Key components

- `backend/`: FastAPI application with model loading, resume parsing, prediction, fairness auditing, and explainability endpoints
- `frontend/`: React + Vite dashboard for model comparison, fairness audit, explainability, and screening flows
- `artifacts/`: trained ML models, vectorizers, and metadata used by the backend
- `AI_ETHICS.ipynb` and `AI_ETHICS_updated.ipynb`: notebooks used for training and model experimentation
- `decision_log.csv`: record of experiment decisions and evaluations
- `resumes_dataset.jsonl`: dataset used during model development

## Features

### Resume classification
The backend extracts text from uploaded resumes and predicts the most relevant job category using a trained ML classifier.

### Bias-aware hiring comparison
The system evaluates candidates using:

- Model A: biased version that includes applicant-name signals
- Model B: fairer name-blind model

This makes it easy to compare how sensitive features affect hiring decisions.

### Counterfactual testing
By swapping names while keeping resume content fixed, the app can highlight whether a candidate's outcome changes because of the name rather than skill or experience.

### Fairness audit
The bias audit computes metrics such as:

- shortlist rate by demographic proxy
- disparate impact ratio
- demographic gap
- influential name tokens driving decisions

### Explainability
The app supports explainability methods to inspect which resume attributes influence classification decisions:

- LIME
- SHAP

## Directory structure

```text
project/
├── AI_ETHICS.ipynb
├── AI_ETHICS_updated.ipynb
├── README.md
├── requirements.txt
├── decision_log.csv
├── resumes_dataset.jsonl
├── artifacts/
├── backend/
│   ├── README.md
│   ├── main.py
│   ├── model_loader.py
│   ├── prediction.py
│   ├── fairness.py
│   ├── explainability.py
│   ├── resume_parser.py
│   ├── schemas.py
│   ├── config.py
│   ├── test_api.py
│   └── requirements.txt
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
```

## Requirements

### Python backend
- Python 3.10+
- pip

### Frontend
- Node.js 18+
- npm

## Quick start

### 1. Set up the Python environment

From the `project` directory:

```bash
pip install -r requirements.txt
```

Then install backend dependencies:

```bash
cd backend
pip install -r requirements.txt
```

### 2. Start the backend

```bash
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at:

- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

### 3. Start the frontend

From the `project/frontend` directory:

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Backend API highlights

The backend exposes endpoints for:

- `GET /health`
- `POST /predict`
- `POST /screen`
- `POST /bias-audit`
- `POST /explain`

For detailed API documentation and internal module explanations, see `backend/README.md`.

## Notes

This project is intended as a demonstration of AI ethics and fairness in real-world resume screening. It is useful for academic work, presentations, and system design discussions around responsible AI practices.

## License

This project is provided for educational and research purposes.
