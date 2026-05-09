import os
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from docx import Document
from PyPDF2 import PdfReader

STOP_WORDS = {
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
    'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below',
    'between', 'both', 'but', 'by', 'could', 'did', 'do', 'does', 'doing', 'down',
    'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having',
    'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i',
    'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most',
    'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only',
    'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she',
    'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs',
    'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through',
    'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when',
    'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your',
    'yours', 'yourself', 'yourselves'
}

# Common skills keyword bank
SKILLS_BANK = [
    "python", "java", "sql", "CRM", "c++", "c", "javascript", "html", "css",
    "machine learning", "deep learning", "nlp", "data analysis", "pandas",
    "numpy", "scikit-learn", "tensorflow", "keras", "power bi", "tableau",
    "excel", "git", "github", "aws", "docker", "linux", "communication",
    "leadership", "teamwork", "problem solving", "time management",
    "recruitment", "talent acquisition", "ats", "onboarding", "screening",
    "coordination", "hiring", "sourcing", "hr", "google sheets", "figma",
    "mysql", "mongodb", "flask", "django", "rest api", "agile", "scrum"
]

def extract_text_from_docx(filepath):
    doc = Document(filepath)
    return " ".join([para.text for para in doc.paragraphs])

def extract_text_from_pdf(filepath):
    reader = PdfReader(filepath)
    return " ".join(page.extract_text() or '' for page in reader.pages)

def extract_text_from_txt(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        return f.read()

def extract_text(filepath):
    ext = os.path.splitext(filepath)[1].lower()
    if ext == '.docx':
        return extract_text_from_docx(filepath)
    elif ext == '.pdf':
        return extract_text_from_pdf(filepath)
    elif ext == '.txt':
        return extract_text_from_txt(filepath)
    return ""

def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-z\s]', ' ', text)
    tokens = text.split()
    tokens = [t for t in tokens if t not in STOP_WORDS]
    return " ".join(tokens)

def extract_skills(text):
    text_lower = text.lower()
    found = [skill for skill in SKILLS_BANK if skill in text_lower]
    return list(set(found))

def extract_email(text):
    match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    return match.group(0) if match else "Not found"

def extract_phone(text):
    match = re.search(r'(\+?\d[\d\s\-]{8,13}\d)', text)
    return match.group(0).strip() if match else "Not found"

def extract_name(text):
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    return lines[0] if lines else "Unknown"

def screen_resumes(resume_files, job_description):
    jd_clean = clean_text(job_description)
    jd_skills = extract_skills(job_description)
    results = []

    for filepath in resume_files:
        raw_text = extract_text(filepath)
        if not raw_text.strip():
            continue

        clean = clean_text(raw_text)
        candidate_skills = extract_skills(raw_text)
        matched_skills = list(set(candidate_skills) & set(jd_skills))
        missing_skills = list(set(jd_skills) - set(candidate_skills))

        # TF-IDF cosine similarity score
        try:
            vectorizer = TfidfVectorizer()
            tfidf = vectorizer.fit_transform([jd_clean, clean])
            score = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
        except:
            score = 0.0

        match_pct = round(score * 100, 2)
        skill_score = round((len(matched_skills) / len(jd_skills)) * 100, 2) if jd_skills else 0
        final_score = round((match_pct * 0.5) + (skill_score * 0.5), 2)

        results.append({
            "name": extract_name(raw_text),
            "email": extract_email(raw_text),
            "phone": extract_phone(raw_text),
            "file": os.path.basename(filepath),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "tfidf_score": match_pct,
            "skill_score": skill_score,
            "final_score": final_score,
            "status": "Shortlisted ✅" if final_score >= 40 else "Rejected ❌"
        })

    results.sort(key=lambda x: x['final_score'], reverse=True)
    return results, jd_skills