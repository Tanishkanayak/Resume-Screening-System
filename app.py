import os
import jwt
import datetime
from functools import wraps
from flask import Flask, render_template, request, jsonify, make_response
from werkzeug.utils import secure_filename
from screener import screen_resumes

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__, template_folder='templates', static_folder='static')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
ALLOWED_EXTENSIONS = {'docx', 'txt', 'pdf'}

# User credentials (in production, use proper database)
VALID_CREDENTIALS = {
    'email': 'tanishkanayak24@gmail.com',
    'password': 'Tanu@2410'
}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        elif request.cookies.get('auth_token'):
            token = request.cookies.get('auth_token')

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing credentials'}), 400

    if data['email'] == VALID_CREDENTIALS['email'] and data['password'] == VALID_CREDENTIALS['password']:
        token = jwt.encode({
            'email': data['email'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm='HS256')

        response = make_response(jsonify({'token': token, 'message': 'Login successful'}))
        response.set_cookie('auth_token', token, httponly=True, samesite='Lax')
        return response

    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/api/verify', methods=['GET'])
@token_required
def verify_token():
    return jsonify({'message': 'Token is valid'})

@app.route('/api/logout', methods=['POST'])
@token_required
def logout():
    response = make_response(jsonify({'message': 'Logged out successfully'}))
    response.delete_cookie('auth_token')
    return response

@app.route('/dashboard')
@token_required
def dashboard_page():
    return render_template('index.html')

@app.route('/screen', methods=['POST'])
@token_required
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