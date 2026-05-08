import os
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename
from screener import screen_resumes

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__, template_folder='templates', static_folder='static')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
ALLOWED_EXTENSIONS = {'docx', 'txt', 'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/screen', methods=['POST'])
def screen():
    job_description = request.form.get('job_description', '').strip()
    files = request.files.getlist('resumes')

    if not job_description:
        return jsonify({"error": "Please enter a job description."}), 400
    if not files or all(f.filename == '' for f in files):
        return jsonify({"error": "Please upload at least one resume."}), 400

    saved_paths = []
    for f in files:
        if f and allowed_file(f.filename):
            path = os.path.join(app.config['UPLOAD_FOLDER'], f.filename)
            f.save(path)
            saved_paths.append(path)

    if not saved_paths:
        return jsonify({"error": "Only .docx and .txt files are supported."}), 400

    results, jd_skills = screen_resumes(saved_paths, job_description)
    return jsonify({"results": results, "jd_skills": jd_skills})

if __name__ == '__main__':
    app.run(debug=True)