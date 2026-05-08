# Resume Screening System

An AI-powered resume screening tool that automatically analyzes and ranks candidate resumes against job descriptions using Natural Language Processing and machine learning.

## Features

- 📋 **Job Description Input** - Paste job requirements and desired skills
- 📁 **Batch Resume Upload** - Upload multiple resumes at once (.docx, .txt, .pdf)
- 🔍 **Smart Matching** - TF-IDF + skill-based matching algorithm
- 📊 **Candidate Ranking** - Auto-ranked candidates with detailed scoring
- ✅ **Skill Extraction** - Identifies matched and missing skills per candidate
- 📧 **Contact Info Extraction** - Automatically pulls name, email, and phone
- 🎯 **Shortlist/Reject** - Candidates scored ≥40% are shortlisted

## Tech Stack

- **Backend**: Flask (Python)
- **ML/NLP**: scikit-learn, TF-IDF vectorization
- **Resume Parsing**: python-docx, PyPDF2
- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Styling**: Dark-themed, responsive UI

## Project Structure

```
Resume Screening System/
├── app.py                 # Flask backend & routing
├── screener.py            # Core NLP screening logic
├── requirements.txt       # Python dependencies
├── templates/
│   └── index.html         # Web UI
├── static/
│   └── style.css          # Styling
├── uploads/               # Resume storage (auto-created)
└── README.md
```

## Installation

### Prerequisites
- Python 3.8 or higher
- Git (optional, for cloning)

### Setup Steps

1. **Clone the repository** (or navigate to the project folder):
   ```bash
   git clone https://github.com/Tanishkanayak/Resume-Screening-System.git
   cd "Resume Screening System"
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   
   # Activate it:
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

## Running the App

1. **Start the Flask server**:
   ```bash
   python app.py
   ```

2. **Open your browser** and go to:
   ```
   http://127.0.0.1:5000
   ```

3. **Use the app**:
   - Paste a job description in the text area
   - Upload 1 or more resume files (.docx, .txt, .pdf)
   - Click "🔍 Screen Resumes"
   - View ranked candidates with scores and skill matches

## How It Works

### Screening Algorithm

The system uses a **hybrid approach** combining two scoring methods:

1. **TF-IDF Cosine Similarity** (50% weight)
   - Measures text similarity between job description and resume
   - Scores 0–100%

2. **Skill Matching** (50% weight)
   - Extracts skills from both JD and resume
   - Counts matched skills vs. required skills
   - Scores 0–100%

**Final Score** = (TF-IDF Score × 0.5) + (Skill Score × 0.5)

Candidates with **≥40%** final score are shortlisted.

### Supported File Formats

- `.docx` - Microsoft Word documents
- `.txt` - Plain text files
- `.pdf` - PDF documents

## Dependencies

See `requirements.txt`:
- Flask >= 3.0
- python-docx >= 0.8.11
- PyPDF2 >= 3.0
- scikit-learn >= 1.0

## API Endpoints

### `GET /`
Serves the main UI page.

### `POST /screen`
**Request**:
```json
{
  "job_description": "Python developer with ML experience",
  "resumes": [file1, file2, ...]
}
```

**Response**:
```json
{
  "results": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-234-567-8900",
      "file": "resume.pdf",
      "matched_skills": ["python", "machine learning"],
      "missing_skills": ["aws"],
      "tfidf_score": 75.5,
      "skill_score": 66.67,
      "final_score": 71.09,
      "status": "Shortlisted ✅"
    }
  ],
  "jd_skills": ["python", "machine learning", "aws", "docker"]
}
```

## Customization

### Adding More Skills

Edit the `SKILLS_BANK` list in `screener.py`:
```python
SKILLS_BANK = [
    "python", "java", "react", "your_skill_here", ...
]
```

### Adjusting Score Weights

In the `screen_resumes()` function in `screener.py`, change the weights:
```python
final_score = round((match_pct * 0.6) + (skill_score * 0.4), 2)  # 60% text, 40% skills
```

### Changing Shortlist Threshold

In both `screener.py` and `templates/index.html`, update the threshold (currently 40%):
```python
"status": "Shortlisted ✅" if final_score >= 50 else "Rejected ❌"
```

## Limitations & Future Improvements

- **Current**: Keyword-based skill extraction (basic)
- **Future**: Use spaCy or advanced NER for better entity recognition
- **Current**: Limited to English
- **Future**: Multi-language support
- **Current**: Simple rule-based extraction
- **Future**: Deep learning models for resume understanding

## Troubleshooting

### "No module named 'flask'"
```bash
pip install -r requirements.txt
```

### "Port 5000 already in use"
Change port in `app.py`:
```python
app.run(host='127.0.0.1', port=5001, debug=True)
```

### Files not uploading
- Ensure file size < 16 MB
- Use supported formats: .pdf, .docx, .txt
- Check `uploads/` folder has write permissions

## License

MIT License - Feel free to use and modify!

## Author

Created as an automated resume screening solution for HR teams.

---

**Need help?** Open an issue on [GitHub](https://github.com/Tanishkanayak/Resume-Screening-System/issues)
