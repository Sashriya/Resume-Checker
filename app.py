from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from pypdf import PdfReader
import docx

# Configure Gemini
genai.configure(api_key="AIzaSyCvC-colsjkzdvV-AOAsmI22cgxrkUXiKg")
model = genai.GenerativeModel("gemini-2.0-flash")

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Extract text from uploaded files
def extract_text(file: UploadFile):
    if file.filename.endswith(".pdf"):
        reader = PdfReader(file.file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text

    elif file.filename.endswith(".docx"):
        d = docx.Document(file.file)
        return "\n".join([p.text for p in d.paragraphs])

    else:
        return file.file.read().decode("utf-8", errors="ignore")


@app.post("/resume-analyzer")
async def analyze_resume(job_role: str = Form(...), resume: UploadFile = Form(...)):
    resume_text = extract_text(resume)

    # Strict JSON ONLY output
    prompt = f"""
You are an ATS resume analyzer.

STRICT RULES:
- Output ONLY valid JSON.
- No explanation.
- No markdown.
- No text outside JSON.

JSON FORMAT:
{{
  "match_status": "",
  "ats_score": "",
  "job_match_analysis": "",
  "recommended_jobs": [],
  "missing_keywords": [],
  "ats_friendly_resume": "",
  "summary": ""
}}

Analyze the resume.

JOB ROLE:
{job_role}

RESUME:
\"\"\"
{resume_text}
\"\"\"

Return ONLY JSON.
"""

    response = model.generate_content(prompt)
    return {"result": response.text}
