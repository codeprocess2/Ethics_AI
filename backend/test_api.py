import io
import pytest
from fastapi.testclient import TestClient
import docx
import pymupdf

from main import app
from model_loader import registry

@pytest.fixture(scope="session", autouse=True)
def load_models():
    """Ensure models are loaded once for test suite."""
    registry.load_artifacts()

@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client

def test_health_endpoint(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "artifacts_status" in data
    assert data["artifacts_status"]["resume_classifier"] is True
    assert data["artifacts_status"]["model_a_biased"] is True
    assert data["artifacts_status"]["model_b_fair"] is True

def test_predict_txt_upload(client):
    resume_content = (
        "Experienced Python Developer with expertise in Django, FastAPI, Machine Learning, "
        "SQL, and Docker. 5 years building scalable web services."
    )
    files = {"file": ("test_resume.txt", io.BytesIO(resume_content.encode("utf-8")), "text/plain")}
    response = client.post("/predict?top_k=3", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_category"] == "Python Developer"
    assert data["confidence"] > 0.0
    assert len(data["top_categories"]) == 3
    assert data["filename"] == "test_resume.txt"

def test_predict_pdf_upload(client):
    # Generate in-memory PDF
    doc = pymupdf.open()
    page = doc.new_page()
    page.insert_text((50, 72), "Data Scientist with machine learning, python, deep learning, NLP, and statistics.")
    pdf_bytes = doc.tobytes()
    doc.close()

    files = {"file": ("resume.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    response = client.post("/predict", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_category" in data
    assert data["predicted_category"] in ["Data Science", "Python Developer", "AI Engineer"]

def test_predict_docx_upload(client):
    # Generate in-memory DOCX
    doc = docx.Document()
    doc.add_paragraph("DevOps Engineer skilled in Kubernetes, Terraform, AWS, CI/CD pipelines, and Linux administration.")
    docx_stream = io.BytesIO()
    doc.save(docx_stream)
    docx_stream.seek(0)

    files = {"file": ("resume.docx", docx_stream, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    response = client.post("/predict", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_category" in data
    assert data["confidence"] > 0.0

def test_predict_empty_file_fails(client):
    files = {"file": ("empty.txt", io.BytesIO(b""), "text/plain")}
    response = client.post("/predict", files=files)
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()

def test_predict_invalid_extension_fails(client):
    files = {"file": ("image.png", io.BytesIO(b"binarycontent"), "image/png")}
    response = client.post("/predict", files=files)
    assert response.status_code == 415

def test_screen_form_with_counterfactual(client):
    sample_text = (
        "skill set python developer machine learning engineer 4 years experience "
        "aiml industry certified foundation artificial intelligence nasscom skillup certified"
    )
    payload = {
        "resume_text": sample_text,
        "applicant_name": "Michael Smith",
        "counterfactual_name": "Jennifer Smith"
    }
    response = client.post("/screen", data=payload)
    assert response.status_code == 200
    data = response.json()
    assert "model_a_biased" in data
    assert "model_b_fair" in data
    assert data["counterfactual"] is not None
    assert data["counterfactual"]["name_a"] == "Michael Smith"
    assert data["counterfactual"]["name_b"] == "Jennifer Smith"
    # Ensure scores and verdicts are valid
    assert data["model_a_biased"]["verdict"] in ["Shortlist", "Reject", "Human review needed"]
    assert data["model_b_fair"]["verdict"] in ["Shortlist", "Reject", "Human review needed"]

def test_screen_file_upload(client):
    sample_text = "Senior Python engineer specialized in backend architecture and PostgreSQL."
    files = {"file": ("sample.txt", io.BytesIO(sample_text.encode("utf-8")), "text/plain")}
    data = {"applicant_name": "David Johnson", "counterfactual_name": "Sarah Johnson"}
    response = client.post("/screen", files=files, data=data)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["applicant_name"] == "David Johnson"

def test_screen_missing_data_fails(client):
    response = client.post("/screen", data={})
    assert response.status_code == 400

def test_bias_audit_endpoint(client):
    response = client.post("/bias-audit")
    assert response.status_code == 200
    data = response.json()
    assert data["sample_size"] > 0
    assert len(data["metrics"]) == 2
    assert "model_a_gap" in data
    assert "model_b_gap" in data
    # Model B gap should be 0.0 (name-blind)
    assert abs(data["model_b_gap"]) < 1e-4
    # Disparate impact ratio
    assert data["disparate_impact_ratio_model_b"] == 1.0
    # Top name influences
    assert len(data["top_name_influences"]) > 0

def test_explain_lime_endpoint(client):
    payload = {
        "resume_text": "Python developer with machine learning, sql, data science, and deep learning expertise.",
        "method": "lime",
        "num_features": 5
    }
    response = client.post("/explain", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["method"] == "lime"
    assert "target_category" in data
    assert len(data["features"]) > 0
    assert all("feature" in f and "weight" in f for f in data["features"])

