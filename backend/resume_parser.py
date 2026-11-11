import io
import re
from typing import Optional
import pymupdf
import docx
from fastapi import UploadFile, HTTPException

def clean_resume(text: str, name: Optional[str] = None) -> str:
    """Exact preprocessing function from Phase 2 (Cell 7) of AI_ETHICS_updated.ipynb."""
    text = str(text)

    # Remove email addresses
    text = re.sub(r'\S+@\S+', ' ', text)

    # Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', ' ', text)

    # Remove phone numbers
    text = re.sub(r'\+?\d[\d\s().-]{7,}\d', ' ', text)

    # Remove template name ("jessica claire" and typos)
    text = re.sub(r'\w*(?:jessica|claire)\w*|\bjes\w*cl\w*', ' ', text, flags=re.IGNORECASE)

    # Mask candidate name if provided
    if name is not None and str(name).strip() and str(name).strip() != "nan":
        text = re.sub(re.escape(str(name).strip()), ' ', text, flags=re.IGNORECASE)

    # Convert text to lowercase
    text = text.lower()

    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text)

    return text.strip()

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts plain text from PDF bytes using PyMuPDF."""
    try:
        doc = pymupdf.open(stream=file_bytes, filetype="pdf")
        pages_text = []
        for page in doc:
            pages_text.append(page.get_text() or "")
        doc.close()
        text = "\n".join(pages_text).strip()
        return text
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to parse PDF document: {str(e)}"
        )

def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extracts plain text from DOCX bytes using python-docx."""
    try:
        doc_stream = io.BytesIO(file_bytes)
        doc = docx.Document(doc_stream)
        paragraphs_text = [p.text for p in doc.paragraphs if p.text]
        # Also extract table text
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    if cell.text.strip():
                        paragraphs_text.append(cell.text.strip())
        return "\n".join(paragraphs_text).strip()
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to parse DOCX document: {str(e)}"
        )

async def parse_resume_upload(file: UploadFile) -> str:
    """Validates and extracts raw text from an uploaded resume file."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Uploaded file has no filename.")

    filename_lower = file.filename.lower()
    content = await file.read()

    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty (0 bytes).")

    if filename_lower.endswith(".pdf"):
        raw_text = extract_text_from_pdf(content)
    elif filename_lower.endswith(".docx"):
        raw_text = extract_text_from_docx(content)
    elif filename_lower.endswith(".txt"):
        try:
            raw_text = content.decode("utf-8")
        except UnicodeDecodeError:
            raw_text = content.decode("latin-1", errors="ignore")
    else:
        raise HTTPException(
            status_code=415,
            detail="Unsupported file format. Please upload a PDF (.pdf), DOCX (.docx), or plain text (.txt) file."
        )

    if not raw_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract readable text from the uploaded document."
        )

    return raw_text

