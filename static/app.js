// Main Application Logic for Resume Screening System

// Theme Toggle
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  const newTheme = isDark ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon();
}

function updateThemeIcon() {
  const icon = document.getElementById('themeIcon');
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
}

// Initialize theme on load
window.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon();
});

// File handling
const fileInput = document.getElementById('resumeFiles');
const fileList = document.getElementById('fileList');

fileInput.addEventListener('change', () => {
  updateFileList();
});

function updateFileList() {
  fileList.innerHTML = '';
  const files = fileInput.files;
  document.getElementById('fileCount').textContent = files.length === 0 ? 'No files selected' : `${files.length} file${files.length !== 1 ? 's' : ''} selected`;

  Array.from(files).forEach((f, idx) => {
    const tag = document.createElement('div');
    tag.className = 'file-tag';
    tag.innerHTML = `
      <span class="file-name">
        <i class="fas fa-file"></i> ${f.name}
      </span>
      <button type="button" class="file-remove" onclick="removeFile(${idx})">
        <i class="fas fa-times"></i>
      </button>
    `;
    fileList.appendChild(tag);
  });
}

function removeFile(index) {
  const dt = new DataTransfer();
  const files = fileInput.files;
  for (let i = 0; i < files.length; i++) {
    if (i !== index) {
      dt.items.add(files[i]);
    }
  }
  fileInput.files = dt.files;
  updateFileList();
}

// Drag and drop
const uploadArea = document.getElementById('uploadArea');

uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('drag-over');
  fileInput.files = e.dataTransfer.files;
  updateFileList();
});

// Screen resumes (legacy function for backward compatibility)
async function screenResumes() {
  return screenResumesWithEffect();
}

// Enhanced screen resumes function with effects (imported from effects.js)
async function screenResumesWithEffect() {
  const jd = document.getElementById('jd').value.trim();
  const files = document.querySelector('#resumeFiles').files;

  if (!jd) {
    // Shake animation for empty JD
    const jdTextarea = document.getElementById('jd');
    jdTextarea.classList.add('shake');
    setTimeout(() => jdTextarea.classList.remove('shake'), 500);
    return;
  }

  if (!files.length) {
    // Shake animation for upload area
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.classList.add('shake');
    setTimeout(() => uploadArea.classList.remove('shake'), 500);
    return;
  }

  // Success animation - button glow and particles
  const button = document.querySelector('.btn-screen');
  button.classList.add('success-pulse');

  const rect = button.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  // Create particle explosion (if particle system exists)
  if (window.particleSystem) {
    window.particleSystem.createExplosion(centerX, centerY, 25);
  }

  const formData = new FormData();
  formData.append('job_description', jd);
  Array.from(files).forEach(f => formData.append('resumes', f));

  document.getElementById('loader').classList.remove('hidden');
  document.getElementById('results').innerHTML = '';
  document.getElementById('emptyState').classList.add('hidden');

  try {
    const res = await fetch('/screen', { method: 'POST', body: formData });
    const data = await res.json();
    document.getElementById('loader').classList.add('hidden');

    if (data.error) {
      alert(data.error);
      document.getElementById('emptyState').classList.remove('hidden');
      button.classList.remove('success-pulse');
      return;
    }

    // Success - more particles and render results with animations
    if (window.particleSystem) {
      window.particleSystem.createExplosion(centerX, centerY, 30);
    }
    renderResultsWithAnimations(data.results, data.jd_skills);
    button.classList.remove('success-pulse');

  } catch (e) {
    document.getElementById('loader').classList.add('hidden');
    alert('Error: Is Flask running on http://127.0.0.1:5000?');
    document.getElementById('emptyState').classList.remove('hidden');
    button.classList.remove('success-pulse');
  }
}

function renderResultsWithAnimations(results, jdSkills) {
  const container = document.getElementById('results');
  const shortlisted = results.filter(r => r.final_score >= 40).length;

  let html = `
    <div class="results-summary">
      <h2><i class="fas fa-chart-bar"></i> Screening Results</h2>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-number" data-target="${results.length}">0</div>
          <div class="summary-label">Total Candidates</div>
        </div>
        <div class="summary-item shortlisted">
          <div class="summary-number" data-target="${shortlisted}">0</div>
          <div class="summary-label">Shortlisted</div>
        </div>
        <div class="summary-item rejected">
          <div class="summary-number" data-target="${results.length - shortlisted}">0</div>
          <div class="summary-label">Rejected</div>
        </div>
        <div class="summary-item">
          <div class="summary-number" data-target="${jdSkills.length}">0</div>
          <div class="summary-label">Required Skills</div>
        </div>
      </div>
    </div>

    <div class="candidates-list">
      <h3><i class="fas fa-list"></i> Ranked Candidates</h3>
  `;

  results.forEach((r, i) => {
    const isShortlisted = r.final_score >= 40;
    const statusIcon = isShortlisted ? '✅' : '❌';
    html += `
      <div class="candidate-card ${isShortlisted ? 'shortlisted' : 'rejected'} stagger-item">
        <div class="candidate-rank">#${i + 1}</div>

        <div class="candidate-main">
          <div class="candidate-info">
            <h3 class="candidate-name">${r.name}</h3>
            <div class="candidate-contact">
              <span><i class="fas fa-envelope"></i> ${r.email}</span>
              <span><i class="fas fa-phone"></i> ${r.phone}</span>
              <span><i class="fas fa-file"></i> ${r.file}</span>
            </div>
          </div>

          <div class="candidate-score">
            <div class="score-display ${isShortlisted ? 'score-high' : 'score-low'}">
              <div class="score-value">${r.final_score}%</div>
              <div class="score-status">${statusIcon}</div>
            </div>
          </div>
        </div>

        <div class="score-breakdown">
          <div class="score-item">
            <div class="score-label">
              <span>Text Match</span>
              <span class="score-value-small">${r.tfidf_score}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" data-width="${r.tfidf_score}" style="width: 0%; background: linear-gradient(90deg, #6366f1, #8b5cf6);"></div>
            </div>
          </div>
          <div class="score-item">
            <div class="score-label">
              <span>Skill Match</span>
              <span class="score-value-small">${r.skill_score}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" data-width="${r.skill_score}" style="width: 0%; background: linear-gradient(90deg, #10b981, #34d399);"></div>
            </div>
          </div>
        </div>

        <div class="skills-container">
          <div class="skills-group">
            <h4><i class="fas fa-check-circle"></i> Matched Skills (${r.matched_skills.length})</h4>
            <div class="skills-list">
              ${r.matched_skills.length ? r.matched_skills.map(s => `<span class="skill-badge match"><i class="fas fa-check"></i> ${s}</span>`).join('') : '<span class="skill-empty">No matched skills</span>'}
            </div>
          </div>
          <div class="skills-group">
            <h4><i class="fas fa-times-circle"></i> Missing Skills (${r.missing_skills.length})</h4>
            <div class="skills-list">
              ${r.missing_skills.length ? r.missing_skills.map(s => `<span class="skill-badge missing"><i class="fas fa-times"></i> ${s}</span>`).join('') : '<span class="skill-empty">All skills matched!</span>'}
            </div>
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;

  // Animate counters
  document.querySelectorAll('.summary-number[data-target]').forEach(element => {
    const target = parseInt(element.dataset.target);
    const counter = new AnimatedCounter(element, target, 1500);
    counter.start();
  });

  // Animate progress bars
  setTimeout(() => {
    document.querySelectorAll('.progress-fill[data-width]').forEach(fill => {
      const width = fill.dataset.width;
      fill.style.width = `${width}%`;
    });
  }, 500);

  // Stagger card animations
  document.querySelectorAll('.stagger-item').forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('animate-in');
    }, index * 150);
  });
}

// Utility functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Add loading states
function showLoading() {
  document.getElementById('loader').classList.remove('hidden');
  document.getElementById('results').innerHTML = '';
  document.getElementById('emptyState').classList.add('hidden');
}

function hideLoading() {
  document.getElementById('loader').classList.add('hidden');
}

// Error handling
function showError(message) {
  hideLoading();
  alert(message);
  document.getElementById('emptyState').classList.remove('hidden');
}

// Success feedback
function showSuccess() {
  // Could add success toast or animation here
  console.log('Screening completed successfully!');
}

// Logout function
async function logout() {
  try {
    const token = localStorage.getItem('auth_token');
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'same-origin',
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {}
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('auth_token');
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    window.location.href = '/';
  }
}

// Export functions for global use
window.toggleTheme = toggleTheme;
window.updateThemeIcon = updateThemeIcon;
window.updateFileList = updateFileList;
window.removeFile = removeFile;
window.screenResumes = screenResumes;
window.screenResumesWithEffect = screenResumesWithEffect;
window.renderResultsWithAnimations = renderResultsWithAnimations;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showError = showError;
window.showSuccess = showSuccess;
window.logout = logout;