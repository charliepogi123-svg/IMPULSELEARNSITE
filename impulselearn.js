// ===== IMPULSELEARN - Fixed & Improved JavaScript =====

// ===== GLOBAL STATE =====
const AppState = {
  currentUser: null,
  userRole: null,
  xp: 0,
  level: 1,
  completedMissions: [],
  quizScores: {},
  activityProgress: {},
  examScores: {},
  submittedQuizzes: [],
  submittedExams: []
};

// ===== DATABASE (localStorage) =====
const DB = {
  getUsers: () => JSON.parse(localStorage.getItem('impulselearn_users') || '[]'),
  saveUsers: (users) => localStorage.setItem('impulselearn_users', JSON.stringify(users)),
  
  getCurrentUser: () => JSON.parse(localStorage.getItem('impulselearn_current_user') || 'null'),
  setCurrentUser: (user) => localStorage.setItem('impulselearn_current_user', JSON.stringify(user)),
  
  getUserByEmail: (email) => {
    const users = DB.getUsers();
    return users.find(u => u.email === email);
  },
  
  registerUser: (userData) => {
    const users = DB.getUsers();
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) return false;
    
    users.push({
      ...userData,
      id: Date.now(),
      approved: false,
      xp: 0,
      level: 1,
      completedMissions: [],
      quizScores: {},
      activityProgress: {},
      examScores: {},
      submittedQuizzes: [],
      submittedExams: [],
      registeredAt: new Date().toISOString()
    });
    
    DB.saveUsers(users);
    return true;
  },
  
  approveUser: (userId) => {
    const users = DB.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      user.approved = true;
      DB.saveUsers(users);
      return true;
    }
    return false;
  },
  
  updateUserProgress: (email, progressData) => {
    const users = DB.getUsers();
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...progressData };
      DB.saveUsers(users);
      return true;
    }
    return false;
  }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  checkAuth();
  initDragDrop();
  initQuizzes();
  initSimulation();
  initMissions();
  loadUserProgress();
});

// ===== NAVIGATION =====
function initNavigation() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      
      if (scrollPos >= top && scrollPos < top + height) {
        document.querySelectorAll('.nav-links a').forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
}

// ===== AUTHENTICATION SYSTEM =====
function checkAuth() {
  const currentUser = DB.getCurrentUser();
  if (currentUser) {
    AppState.currentUser = currentUser.email;
    AppState.userRole = currentUser.role;
    AppState.xp = currentUser.xp || 0;
    AppState.level = currentUser.level || 1;
    AppState.completedMissions = currentUser.completedMissions || [];
    AppState.quizScores = currentUser.quizScores || {};
    AppState.activityProgress = currentUser.activityProgress || {};
    AppState.examScores = currentUser.examScores || {};
    AppState.submittedQuizzes = currentUser.submittedQuizzes || [];
    AppState.submittedExams = currentUser.submittedExams || [];
    updateXPDisplay();
    
    // Redirect teachers away from student pages
    if (currentUser.role === 'teacher') {
      const studentPages = ['student-dashboard.html', 'lessons.html', 'activities.html', 'quizzes.html', 'exams.html', 'missions.html', 'simulation.html', 'tutorial.html'];
      const currentPage = window.location.pathname;
      const isStudentPage = studentPages.some(page => currentPage.includes(page));
      
      if (isStudentPage && !currentPage.includes('teacher-dashboard.html')) {
        window.location.href = 'teacher-dashboard.html';
      }
    }
  }
}

function registerStudent(e) {
  e.preventDefault();
  
  const fullName = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;
  
  if (password !== confirmPassword) {
    showNotification('Passwords do not match!', 'error');
    return;
  }
  
  if (password.length < 6) {
    showNotification('Password must be at least 6 characters!', 'error');
    return;
  }
  
  const success = DB.registerUser({
    fullName,
    email,
    password,
    role: 'student'
  });
  
  if (success) {
    showNotification('Registration successful! Please wait for teacher approval.', 'success');
    document.getElementById('registerForm').reset();
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
  } else {
    showNotification('Email already registered!', 'error');
  }
}

function loginStudent(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  const user = DB.getUserByEmail(email);
  
  if (!user) {
    showNotification('Invalid email or password!', 'error');
    return;
  }
  
  if (user.role !== 'student') {
    showNotification('Access denied. Students only!', 'error');
    return;
  }
  
  if (!user.approved) {
    showNotification('Your account is pending approval. Please wait for teacher approval.', 'warning');
    return;
  }
  
  if (user.password !== password) {
    showNotification('Invalid email or password!', 'error');
    return;
  }
  
  // Login successful
  AppState.currentUser = email;
  AppState.userRole = 'student';
  AppState.xp = user.xp || 0;
  AppState.level = user.level || 1;
  AppState.completedMissions = user.completedMissions || [];
  AppState.quizScores = user.quizScores || {};
  AppState.activityProgress = user.activityProgress || {};
  AppState.examScores = user.examScores || {};
  AppState.submittedQuizzes = user.submittedQuizzes || [];
  AppState.submittedExams = user.submittedExams || [];
  
  DB.setCurrentUser(user);
  showNotification('Login successful! Welcome!', 'success');
  
  setTimeout(() => {
    window.location.href = 'student-dashboard.html';
  }, 1000);
}

function loginTeacher(e) {
  e.preventDefault();
  
  const username = document.getElementById('teacherUsername').value;
  const password = document.getElementById('teacherPassword').value;
  
  // Get stored admin credentials from database
  let users = DB.getUsers();
  let adminUser = users.find(u => u.role === 'teacher');
  
  // If no admin exists, create default admin account
  if (!adminUser) {
    const defaultAdmin = {
      id: Date.now(),
      email: 'admin',
      role: 'teacher',
      fullName: 'Administrator',
      username: 'admin',
      password: 'admin123',
      approved: true,
      xp: 0,
      level: 1,
      completedMissions: [],
      quizScores: {},
      activityProgress: {},
      examScores: {},
      submittedQuizzes: [],
      submittedExams: [],
      registeredAt: new Date().toISOString()
    };
    
    users.push(defaultAdmin);
    DB.saveUsers(users);
    adminUser = defaultAdmin;
  }
  
  // Check against stored credentials
  if (username === adminUser.username && password === adminUser.password) {
    AppState.currentUser = 'admin';
    AppState.userRole = 'teacher';
    
    const userData = {
      email: 'admin',
      role: 'teacher',
      fullName: 'Administrator',
      username: adminUser.username,
      password: adminUser.password
    };
    
    DB.setCurrentUser(userData);
    showNotification('Welcome, Admin!', 'success');
    
    setTimeout(() => {
      window.location.href = 'teacher-dashboard.html';
    }, 1000);
  } else {
    showNotification('Invalid credentials!', 'error');
  }
}

function logout() {
  DB.setCurrentUser(null);
  AppState.currentUser = null;
  AppState.userRole = null;
  AppState.xp = 0;
  AppState.level = 1;
  AppState.completedMissions = [];
  AppState.quizScores = {};
  AppState.activityProgress = {};
  AppState.examScores = {};
  AppState.submittedQuizzes = [];
  AppState.submittedExams = [];
  
  showNotification('Logged out successfully!', 'info');
  window.location.href = 'index.html';
}

// ===== XP SYSTEM (PERSISTENT) =====
function addXP(amount) {
  console.log('Adding XP:', amount, 'Current XP:', AppState.xp);
  AppState.xp += amount;
  const newLevel = Math.floor(AppState.xp / 100) + 1;
  
  if (newLevel > AppState.level) {
    AppState.level = newLevel;
    showLevelUpNotification();
  }
  
  saveUserProgress();
  updateXPDisplay();
  console.log('New XP:', AppState.xp, 'Level:', AppState.level);
}

function saveUserProgress() {
  console.log('Saving progress...', AppState.currentUser, AppState.userRole);
  if (AppState.currentUser && AppState.userRole === 'student') {
    const success = DB.updateUserProgress(AppState.currentUser, {
      xp: AppState.xp,
      level: AppState.level,
      completedMissions: AppState.completedMissions,
      quizScores: AppState.quizScores,
      activityProgress: AppState.activityProgress,
      examScores: AppState.examScores,
      submittedQuizzes: AppState.submittedQuizzes,
      submittedExams: AppState.submittedExams
    });
    console.log('Save success:', success);
  }
}

function loadUserProgress() {
  const currentUser = DB.getCurrentUser();
  if (currentUser && currentUser.role === 'student') {
    AppState.xp = currentUser.xp || 0;
    AppState.level = currentUser.level || 1;
    AppState.completedMissions = currentUser.completedMissions || [];
    AppState.quizScores = currentUser.quizScores || {};
    AppState.activityProgress = currentUser.activityProgress || {};
    AppState.examScores = currentUser.examScores || {};
    AppState.submittedQuizzes = currentUser.submittedQuizzes || [];
    AppState.submittedExams = currentUser.submittedExams || [];
    updateXPDisplay();
    console.log('Loaded progress:', AppState.xp, 'XP');
  }
}

function updateXPDisplay() {
  document.querySelectorAll('.xp-value').forEach(el => el.textContent = AppState.xp);
  document.querySelectorAll('.level-value').forEach(el => el.textContent = AppState.level);
}

function showLevelUpNotification() {
  const notification = document.createElement('div');
  notification.className = 'level-up-notification';
  notification.innerHTML = `
    <div class="level-up-content">
      <h2>🎉 Level Up!</h2>
      <p>You reached Level ${AppState.level}!</p>
    </div>
  `;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #6c5ce7, #a29bfe);
    color: white;
    padding: 1.5rem 2rem;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(108, 92, 231, 0.5);
    z-index: 10000;
    animation: slideInRight 0.5s ease;
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// ===== DRAG AND DROP ACTIVITY =====
function initDragDrop() {
  const dragItems = document.querySelectorAll('.drag-item');
  const dropZones = document.querySelectorAll('.drop-zone');
  
  dragItems.forEach(item => {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);
  });
  
  dropZones.forEach(zone => {
    zone.addEventListener('dragover', handleDragOver);
    zone.addEventListener('drop', handleDrop);
    zone.addEventListener('dragleave', handleDragLeave);
  });
}

let draggedItem = null;

function handleDragStart(e) {
  draggedItem = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd() {
  this.classList.remove('dragging');
}

function handleDragOver(e) {
  e.preventDefault();
  this.classList.add('drag-over');
}

function handleDragLeave() {
  this.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  
  if (draggedItem && this.dataset.answer === draggedItem.dataset.value) {
    this.classList.add('correct');
    this.textContent = draggedItem.textContent;
    draggedItem.style.display = 'none';
    addXP(10);
    checkActivityComplete();
  } else {
    this.classList.add('incorrect');
    setTimeout(() => this.classList.remove('incorrect'), 1000);
  }
}

function checkActivityComplete() {
  const dropZones = document.querySelectorAll('.drop-zone');
  const correctCount = document.querySelectorAll('.drop-zone.correct').length;
  
  if (correctCount === dropZones.length) {
    showNotification('🎉 Activity Complete! +50 XP', 'success');
    addXP(50);
  }
}

// ===== QUIZ SYSTEM (FIXED) =====
function initQuizzes() {
  const quizForms = document.querySelectorAll('.quiz-form');
  quizForms.forEach(form => {
    form.addEventListener('submit', handleQuizSubmit);
  });
  
  document.querySelectorAll('.option').forEach(option => {
    option.addEventListener('click', function() {
      const questionCard = this.closest('.question-card');
      if (questionCard) {
        questionCard.querySelectorAll('.option').forEach(opt => {
          opt.classList.remove('selected');
        });
        this.classList.add('selected');
        this.querySelector('input[type="radio"]').checked = true;
      }
    });
  });
}

function handleQuizSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const quizId = form.dataset.quizId;
  
  console.log('Submitting quiz:', quizId, 'Already submitted:', AppState.submittedQuizzes);
  
  // Check if already submitted
  if (AppState.submittedQuizzes.includes(quizId)) {
    showNotification('You have already submitted this quiz!', 'warning');
    return;
  }
  
  const questions = form.querySelectorAll('.question-card');
  let correct = 0;
  let total = questions.length;
  
  questions.forEach((question, index) => {
    const selected = question.querySelector('input[type="radio"]:checked');
    const correctAnswer = question.dataset.correct;
    const options = question.querySelectorAll('.option');
    
    options.forEach(opt => opt.classList.remove('correct', 'incorrect'));
    
    if (selected && selected.value === correctAnswer) {
      correct++;
      options.forEach(opt => {
        if (opt.querySelector('input').value === correctAnswer) {
          opt.classList.add('correct');
        }
      });
    } else {
      options.forEach(opt => {
        if (opt.querySelector('input').value === correctAnswer) {
          opt.classList.add('correct');
        } else if (opt === selected) {
          opt.classList.add('incorrect');
        }
      });
    }
  });
  
  const score = Math.round((correct / total) * 100);
  showQuizResults(score, correct, total);
  addXP(score);
  
  // Mark quiz as submitted
  AppState.submittedQuizzes.push(quizId);
  AppState.quizScores[quizId] = score;
  saveUserProgress();
  
  console.log('Quiz submitted:', quizId, 'Score:', score, 'Submitted quizzes:', AppState.submittedQuizzes);
  
  // Disable submit button
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = '✓ Quiz Submitted';
    submitBtn.style.opacity = '0.5';
    submitBtn.style.cursor = 'not-allowed';
  }
  
  // Unlock next quiz
  unlockNextQuiz(quizId);
}

function unlockNextQuiz(currentQuizId) {
  const quizNumber = parseInt(currentQuizId.replace('quiz', ''));
  const nextQuizNumber = quizNumber + 1;
  
  console.log('Unlocking quiz:', nextQuizNumber);
  
  if (quizNumber < 5) {
    const nextQuizButton = document.getElementById(`quiz${nextQuizNumber}Btn`);
    if (nextQuizButton) {
      nextQuizButton.disabled = false;
      nextQuizButton.style.opacity = '1';
      nextQuizButton.style.cursor = 'pointer';
      nextQuizButton.classList.remove('disabled');
      nextQuizButton.innerHTML = `📝 Quiz ${nextQuizNumber}: ${getQuizTitle(nextQuizNumber)}`;
      showNotification(`🎉 Quiz ${nextQuizNumber} unlocked!`, 'success');
    }
  }
}

function getQuizTitle(num) {
  const titles = {
    2: 'Understanding Impulse',
    3: 'Momentum-Impulse Relationship',
    4: 'Conservation Laws',
    5: 'Real-World Applications'
  };
  return titles[num] || '';
}

function showQuizResults(score, correct, total) {
  const resultsDiv = document.getElementById('quizResults');
  if (resultsDiv) {
    resultsDiv.innerHTML = `
      <div class="results-card">
        <h2>Quiz Complete!</h2>
        <div class="score-circle ${score >= 50 ? 'pass' : 'fail'}">
          <span class="score-value">${score}%</span>
        </div>
        <p>You got ${correct} out of ${total} questions correct</p>
        ${score >= 50 ? '<p class="pass-message">🌟 Good job! Quiz passed!</p>' : '<p class="retry-message">Keep practicing!</p>'}
      </div>
    `;
    resultsDiv.classList.remove('hidden');
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
  }
}

// ===== EXAM SYSTEM (FIXED) =====
function initExam() {
  const examForm = document.getElementById('examForm');
  if (examForm) {
    examForm.addEventListener('submit', handleExamSubmit);
  }
  
  const examForm2 = document.getElementById('examForm2');
  if (examForm2) {
    examForm2.addEventListener('submit', handleExamSubmit2);
  }
}

let examTimeRemaining = 0;
let examTimerInterval = null;

function startExam(examNumber) {
  // Block teachers
  if (AppState.userRole === 'teacher') {
    showNotification('Teachers cannot take exams!', 'warning');
    return;
  }
  
  document.querySelectorAll('.quiz-section').forEach(section => {
    section.style.display = 'none';
  });
  
  const selectedExam = document.getElementById('exam' + examNumber);
  if (selectedExam) {
    selectedExam.style.display = 'block';
    selectedExam.scrollIntoView({ behavior: 'smooth' });
    
    if (examTimerInterval) clearInterval(examTimerInterval);
    examTimeRemaining = 3600;
    updateExamTimer(examNumber);
    examTimerInterval = setInterval(() => {
      examTimeRemaining--;
      updateExamTimer(examNumber);
      
      if (examTimeRemaining <= 0) {
        clearInterval(examTimerInterval);
        alert('Time is up! Your exam will be submitted automatically.');
        const formId = examNumber === 1 ? 'examForm' : 'examForm2';
        const form = document.getElementById(formId);
        if (form) form.dispatchEvent(new Event('submit'));
      }
    }, 1000);
  }
}

function updateExamTimer(examNumber) {
  const timerId = examNumber === 1 ? 'examTimer' : 'examTimer2';
  const timerElement = document.getElementById(timerId);
  if (timerElement) {
    const minutes = Math.floor(examTimeRemaining / 60);
    const seconds = examTimeRemaining % 60;
    timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

function handleExamSubmit(e) {
  e.preventDefault();
  if (examTimerInterval) clearInterval(examTimerInterval);
  
  const examId = 'exam1';
  
  // Check if already submitted
  if (AppState.submittedExams.includes(examId)) {
    showNotification('You have already submitted this exam!', 'warning');
    return;
  }
  
  const form = document.getElementById('examForm');
  if (!form) return;
  
  const questions = form.querySelectorAll('.question-card');
  let correct = 0;
  let total = questions.length;
  
  questions.forEach(question => {
    const selected = question.querySelector('input[type="radio"]:checked');
    const correctAnswer = question.dataset.correct;
    
    if (selected && selected.value === correctAnswer) {
      correct++;
    }
  });
  
  const score = Math.round((correct / total) * 100);
  showExamResults(score, correct, total, 'examResults');
  addXP(score);
  
  AppState.submittedExams.push(examId);
  AppState.examScores[examId] = score;
  saveUserProgress();
  
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = '✓ Exam Submitted';
    submitBtn.style.opacity = '0.5';
    submitBtn.style.cursor = 'not-allowed';
  }
}

function handleExamSubmit2(e) {
  e.preventDefault();
  if (examTimerInterval) clearInterval(examTimerInterval);
  
  const examId = 'exam2';
  
  if (AppState.submittedExams.includes(examId)) {
    showNotification('You have already submitted this exam!', 'warning');
    return;
  }
  
  const form = document.getElementById('examForm2');
  if (!form) return;
  
  const questions = form.querySelectorAll('.question-card');
  let correct = 0;
  let total = questions.length;
  
  questions.forEach(question => {
    const selected = question.querySelector('input[type="radio"]:checked');
    const correctAnswer = question.dataset.correct;
    
    if (selected && selected.value === correctAnswer) {
      correct++;
    }
  });
  
  const score = Math.round((correct / total) * 100);
  showExamResults(score, correct, total, 'examResults2');
  addXP(score);
  
  AppState.submittedExams.push(examId);
  AppState.examScores[examId] = score;
  saveUserProgress();
  
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = '✓ Exam Submitted';
    submitBtn.style.opacity = '0.5';
    submitBtn.style.cursor = 'not-allowed';
  }
}

function showExamResults(score, correct, total, resultsId) {
  const resultsDiv = document.getElementById(resultsId);
  if (resultsDiv) {
    resultsDiv.innerHTML = `
      <div class="results-card">
        <h2>Exam Complete!</h2>
        <div class="score-circle ${score >= 50 ? 'pass' : 'fail'}">
          <span class="score-value">${score}%</span>
        </div>
        <p>You got ${correct} out of ${total} questions correct</p>
        ${score >= 50 ? '<p class="pass-message">🎓 Congratulations! You passed!</p>' : '<p class="retry-message">Study more and try again!</p>'}
      </div>
    `;
    resultsDiv.classList.remove('hidden');
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
  }
}

// ===== SIMULATION (Three.js) =====
let scene, camera, renderer, objects = [];
let simulationRunning = false;

function initSimulation() {
  const canvas = document.getElementById('simulation-canvas');
  if (!canvas) return;
  
  try {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x0f0f1e, 1);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x6c5ce7, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    createSimulationObjects();
    
    const gridHelper = new THREE.GridHelper(20, 20, 0x6c5ce7, 0x2a2a4e);
    scene.add(gridHelper);
    
    camera.position.set(0, 10, 15);
    camera.lookAt(0, 0, 0);
    
    initSimulationControls();
    animateSimulation();
    
    window.addEventListener('resize', () => {
      if (canvas) {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      }
    });
  } catch (error) {
    console.error('Simulation initialization error:', error);
  }
}

function createSimulationObjects() {
  const geometry1 = new THREE.BoxGeometry(2, 2, 2);
  const material1 = new THREE.MeshPhongMaterial({ 
    color: 0x6c5ce7,
    emissive: 0x6c5ce7,
    emissiveIntensity: 0.3
  });
  const object1 = new THREE.Mesh(geometry1, material1);
  object1.position.set(-5, 1, 0);
  object1.userData = { mass: 5, velocity: 3, name: 'Object A' };
  scene.add(object1);
  objects.push(object1);
  
  const geometry2 = new THREE.SphereGeometry(1.5, 32, 32);
  const material2 = new THREE.MeshPhongMaterial({ 
    color: 0x00cec9,
    emissive: 0x00cec9,
    emissiveIntensity: 0.3
  });
  const object2 = new THREE.Mesh(geometry2, material2);
  object2.position.set(5, 1.5, 0);
  object2.userData = { mass: 3, velocity: -2, name: 'Object B' };
  scene.add(object2);
  objects.push(object2);
}

function initSimulationControls() {
  const mass1Slider = document.getElementById('mass1');
  const velocity1Slider = document.getElementById('velocity1');
  const mass2Slider = document.getElementById('mass2');
  const velocity2Slider = document.getElementById('velocity2');
  const startBtn = document.getElementById('startSimulation');
  const resetBtn = document.getElementById('resetSimulation');
  
  if (mass1Slider) {
    mass1Slider.addEventListener('input', (e) => {
      objects[0].userData.mass = parseFloat(e.target.value);
      document.getElementById('mass1Value').textContent = e.target.value + ' kg';
      updateObjectScale(objects[0], e.target.value);
    });
  }
  
  if (velocity1Slider) {
    velocity1Slider.addEventListener('input', (e) => {
      objects[0].userData.velocity = parseFloat(e.target.value);
      document.getElementById('velocity1Value').textContent = e.target.value + ' m/s';
    });
  }
  
  if (mass2Slider) {
    mass2Slider.addEventListener('input', (e) => {
      objects[1].userData.mass = parseFloat(e.target.value);
      document.getElementById('mass2Value').textContent = e.target.value + ' kg';
      updateObjectScale(objects[1], e.target.value);
    });
  }
  
  if (velocity2Slider) {
    velocity2Slider.addEventListener('input', (e) => {
      objects[1].userData.velocity = parseFloat(e.target.value);
      document.getElementById('velocity2Value').textContent = e.target.value + ' m/s';
    });
  }
  
  if (startBtn) {
    startBtn.addEventListener('click', startSimulation);
  }
  
  if (resetBtn) {
    resetBtn.addEventListener('click', resetSimulation);
  }
}

function updateObjectScale(object, mass) {
  const scale = 0.5 + (mass / 10);
  object.scale.set(scale, scale, scale);
}

function startSimulation() {
  // Block teachers
  if (AppState.userRole === 'teacher') {
    showNotification('Teachers cannot use simulation!', 'warning');
    return;
  }
  
  simulationRunning = true;
  showNotification('🚀 Simulation Started!', 'info');
}

function resetSimulation() {
  simulationRunning = false;
  objects[0].position.set(-5, 1, 0);
  objects[0].userData.velocity = 3;
  objects[1].position.set(5, 1.5, 0);
  objects[1].userData.velocity = -2;
  showNotification('🔄 Simulation Reset', 'info');
}

function animateSimulation() {
  requestAnimationFrame(animateSimulation);
  
  if (simulationRunning && objects.length === 2) {
    const obj1 = objects[0];
    const obj2 = objects[1];
    
    obj1.position.x += obj1.userData.velocity * 0.01;
    obj2.position.x += obj2.userData.velocity * 0.01;
    
    const distance = Math.abs(obj1.position.x - obj2.position.x);
    if (distance < 2) {
      const v1 = obj1.userData.velocity;
      const v2 = obj2.userData.velocity;
      const m1 = obj1.userData.mass;
      const m2 = obj2.userData.mass;
      
      const newV1 = ((m1 - m2) * v1 + 2 * m2 * v2) / (m1 + m2);
      const newV2 = ((m2 - m1) * v2 + 2 * m1 * v1) / (m1 + m2);
      
      obj1.userData.velocity = newV1;
      obj2.userData.velocity = newV2;
      
      updateSimulationResults();
    }
    
    obj1.rotation.x += 0.01;
    obj1.rotation.y += 0.01;
    obj2.rotation.x += 0.01;
  }
  
  if (renderer) renderer.render(scene, camera);
}

function updateSimulationResults() {
  const obj1 = objects[0];
  const obj2 = objects[1];
  
  const momentum1 = (obj1.userData.mass * obj1.userData.velocity).toFixed(2);
  const momentum2 = (obj2.userData.mass * obj2.userData.velocity).toFixed(2);
  
  const momentum1El = document.getElementById('momentum1');
  const momentum2El = document.getElementById('momentum2');
  const totalMomentumEl = document.getElementById('totalMomentum');
  
  if (momentum1El) momentum1El.textContent = momentum1 + ' kg·m/s';
  if (momentum2El) momentum2El.textContent = momentum2 + ' kg·m/s';
  if (totalMomentumEl) {
    const total = (parseFloat(momentum1) + parseFloat(momentum2)).toFixed(2);
    totalMomentumEl.textContent = total + ' kg·m/s';
  }
}

// ===== MISSIONS SYSTEM (FIXED) =====
function completeMission(missionId) {
  // Block teachers
  if (AppState.userRole === 'teacher') {
    showNotification('Teachers cannot complete missions!', 'warning');
    return;
  }
  
  // Mission validation - check if prerequisites are met
  if (!validateMission(missionId)) {
    showNotification('Complete prerequisites first!', 'warning');
    return;
  }
  
  if (!AppState.completedMissions.includes(missionId)) {
    AppState.completedMissions.push(missionId);
    saveUserProgress();
    updateMissionProgress();
    
    const mission = getMissionDetails(missionId);
    if (mission) {
      showNotification(`✅ Mission Complete: ${mission.title}`, 'success');
      addXP(mission.xp);
    }
  } else {
    showNotification('✓ Mission already completed!', 'info');
  }
}

function validateMission(missionId) {
  switch(missionId) {
    case 'mission-1':
      return AppState.completedMissions.includes('lesson1');
    
    case 'mission-2':
      return AppState.completedMissions.includes('activity1');
    
    case 'mission-3':
      // Just need to complete quiz 1 (any score)
      return AppState.submittedQuizzes.includes('quiz1');
    
    case 'mission-4':
      return true;
    
    case 'mission-5':
      return ['lesson1', 'lesson2', 'lesson3', 'lesson4', 'lesson5']
        .every(lesson => AppState.completedMissions.includes(lesson));
    
    case 'mission-6':
      // Just need to complete all quizzes (any score)
      return ['quiz1', 'quiz2', 'quiz3', 'quiz4', 'quiz5']
        .every(quiz => AppState.submittedQuizzes.includes(quiz));
    
    case 'mission-7':
      // Just need to complete exam 1 (any score)
      return AppState.submittedExams.includes('exam1');
    
    case 'mission-8':
      return AppState.level >= 5;
    
    default:
      return true;
  }
}

function getMissionDetails(missionId) {
  const missions = {
    'mission-1': { title: 'Complete Lesson 1', xp: 50 },
    'mission-2': { title: 'Finish Activity 1', xp: 75 },
    'mission-3': { title: 'Pass Quiz 1 with 80%', xp: 100 },
    'mission-4': { title: 'Complete Simulation', xp: 150 },
    'mission-5': { title: 'Complete All Lessons', xp: 200 },
    'mission-6': { title: 'Pass All Quizzes', xp: 300 },
    'mission-7': { title: 'Complete Exam 1', xp: 250 },
    'mission-8': { title: 'Reach Level 5', xp: 500 }
  };
  return missions[missionId];
}

function updateMissionProgress() {
  const totalMissions = 8;
  const completed = AppState.completedMissions.filter(m => m.startsWith('mission')).length;
  const percentage = (completed / totalMissions) * 100;
  
  const progressBar = document.getElementById('missionProgress');
  if (progressBar) {
    progressBar.style.width = percentage + '%';
  }
  
  const progressText = document.getElementById('missionProgressText');
  if (progressText) {
    progressText.textContent = `${completed}/${totalMissions}`;
  }
  
  const badgeCount = document.getElementById('badgeCount');
  if (badgeCount) {
    badgeCount.textContent = completed;
  }
}

// ===== LEADERBOARD (FIXED) =====
function updateLeaderboard() {
  const users = DB.getUsers().filter(u => u.role === 'student' && u.approved);
  const leaderboard = users
    .map(user => ({
      name: user.fullName,
      level: user.level || 1,
      xp: user.xp || 0,
      missions: (user.completedMissions || []).filter(m => m.startsWith('mission')).length
    }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 10);
  
  const tbody = document.getElementById('leaderboardBody');
  if (tbody) {
    tbody.innerHTML = leaderboard.map((user, index) => `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td style="padding: 1rem;">${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}th`}</td>
        <td style="padding: 1rem;">${user.name}</td>
        <td style="padding: 1rem;">${user.level}</td>
        <td style="padding: 1rem;">${user.xp} XP</td>
        <td style="padding: 1rem;">${user.missions}/8</td>
      </tr>
    `).join('');
  }
}

// ===== NOTIFICATIONS =====
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  const colors = {
    success: 'linear-gradient(135deg, #00b894, #00cec9)',
    error: 'linear-gradient(135deg, #e17055, #fab1a0)',
    info: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
    warning: 'linear-gradient(135deg, #fdcb6e, #ffeaa7)'
  };
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type]};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    animation: slideInRight 0.3s ease;
    font-weight: 600;
    max-width: 300px;
  `;
  
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
  .level-up-notification {
    animation: slideInRight 0.5s ease;
  }
`;
document.head.appendChild(style);

// ===== LESSON COMPLETION =====
function completeLesson(lessonId) {
  // Block teachers
  if (AppState.userRole === 'teacher') {
    showNotification('Teachers cannot complete lessons!', 'warning');
    return;
  }
  
  if (!AppState.completedMissions.includes(lessonId)) {
    AppState.completedMissions.push(lessonId);
    addXP(50);
    saveUserProgress();
    showNotification('📖 Lesson Complete! +50 XP', 'success');
    
    const lessonCard = document.getElementById(lessonId);
    if (lessonCard) {
      lessonCard.classList.add('completed');
    }
  } else {
    showNotification('✓ Lesson already completed!', 'info');
  }
}

// ===== OPTION SELECTION (for activities) =====
function selectOption(element, questionId, correctAnswer) {
  const questionCard = element.closest('.options') || element.parentElement;
  questionCard.querySelectorAll('.option').forEach(opt => {
    opt.classList.remove('selected', 'correct', 'incorrect');
  });
  element.classList.add('selected');
  
  // Store the answer
  if (!window.selectedOptions) window.selectedOptions = {};
  window.selectedOptions[questionId] = correctAnswer;
}

// ===== TRUE/FALSE ANSWER =====
function answerTrueFalse(button, answer) {
  const questionDiv = button.closest('.tf-question');
  const buttons = questionDiv.querySelectorAll('button');
  buttons.forEach(btn => btn.classList.remove('correct', 'incorrect'));
  
  const correctAnswer = questionDiv.dataset.answer === 'true';
  if (answer === correctAnswer) {
    button.classList.add('correct');
  } else {
    button.classList.add('incorrect');
  }
}

// ===== TEACHER DASHBOARD FUNCTIONS =====
function loadTeacherDashboard() {
  const users = DB.getUsers().filter(u => u.role === 'student');
  const approved = users.filter(u => u.approved);
  const pending = users.filter(u => !u.approved);
  
  // Update stats
  const totalStudentsEl = document.getElementById('totalStudents');
  const approvedStudentsEl = document.getElementById('approvedStudents');
  const pendingStudentsEl = document.getElementById('pendingStudents');
  
  if (totalStudentsEl) totalStudentsEl.textContent = users.length;
  if (approvedStudentsEl) approvedStudentsEl.textContent = approved.length;
  if (pendingStudentsEl) pendingStudentsEl.textContent = pending.length;
  
  // Load pending approvals
  loadPendingApprovals(pending);
  
  // Load student table
  loadStudentTable(approved);
  
  // Load leaderboard
  updateLeaderboard();
}

function loadPendingApprovals(pending) {
  const pendingList = document.getElementById('pendingList');
  const approvalSection = document.getElementById('approvalSection');
  
  if (!pendingList) return;
  
  if (pending.length === 0) {
    pendingList.innerHTML = '<p style="color: var(--text-secondary);">No pending approvals</p>';
    if (approvalSection) approvalSection.style.display = 'none';
    return;
  }
  
  if (approvalSection) approvalSection.style.display = 'block';
  
  pendingList.innerHTML = pending.map(user => `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: rgba(108, 92, 231, 0.1); border-radius: 8px; margin-bottom: 1rem;">
      <div>
        <strong style="color: var(--primary);">${user.fullName}</strong>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">${user.email}</p>
        <p style="color: var(--text-secondary); font-size: 0.85rem;">Registered: ${new Date(user.registeredAt).toLocaleDateString()}</p>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <button class="btn primary sm" onclick="approveStudent(${user.id})">✓ Approve</button>
        <button class="btn sm" onclick="rejectStudent(${user.id})">✗ Reject</button>
      </div>
    </div>
  `).join('');
}

function loadStudentTable(students) {
  const tbody = document.getElementById('studentTableBody');
  if (!tbody) return;
  
  if (students.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="padding: 2rem; text-align: center;">No approved students yet</td></tr>';
    return;
  }
  
  tbody.innerHTML = students.map(student => {
    const quizCount = Object.keys(student.quizScores || {}).length;
    const examCount = Object.keys(student.examScores || {}).length;
    const missionCount = (student.completedMissions || []).filter(m => m.startsWith('mission')).length;
    
    return `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td style="padding: 1rem;"><strong>${student.fullName}</strong></td>
        <td style="padding: 1rem;">${student.email}</td>
        <td style="padding: 1rem;">${student.level || 1}</td>
        <td style="padding: 1rem;">${student.xp || 0}</td>
        <td style="padding: 1rem;">${quizCount}/5</td>
        <td style="padding: 1rem;">${examCount}/2</td>
        <td style="padding: 1rem;">${missionCount}/8</td>
        <td style="padding: 1rem;">
          <span style="color: var(--success);">✓ Approved</span>
        </td>
      </tr>
    `;
  }).join('');
}

function approveStudent(userId) {
  if (DB.approveUser(userId)) {
    showNotification('Student approved successfully!', 'success');
    loadTeacherDashboard();
  } else {
    showNotification('Error approving student', 'error');
  }
}

function rejectStudent(userId) {
  const users = DB.getUsers();
  const filteredUsers = users.filter(u => u.id !== userId);
  DB.saveUsers(filteredUsers);
  showNotification('Student registration rejected', 'info');
  loadTeacherDashboard();
}

function viewStudentDetails(studentEmail) {
  const student = DB.getUserByEmail(studentEmail);
  if (!student) {
    showNotification('Student not found!', 'error');
    return;
  }
  
  const details = `Student Details:
Name: ${student.fullName}
Email: ${student.email}
Level: ${student.level || 1}
XP: ${student.xp || 0}
Quizzes: ${Object.keys(student.quizScores || {}).length}/5
Exams: ${Object.keys(student.examScores || {}).length}/2
Missions: ${(student.completedMissions || []).filter(m => m.startsWith('mission')).length}/8`;
  
  alert(details);
}

function removeStudentScore(studentEmail, scoreType) {
  if (!confirm('Are you sure you want to remove this score?')) return;
  
  const users = DB.getUsers();
  const userIndex = users.findIndex(u => u.email === studentEmail);
  
  if (userIndex !== -1) {
    switch(scoreType) {
      case 'quiz':
        users[userIndex].quizScores = {};
        users[userIndex].submittedQuizzes = [];
        break;
      case 'exam':
        users[userIndex].examScores = {};
        users[userIndex].submittedExams = [];
        break;
      case 'activity':
        users[userIndex].completedMissions = users[userIndex].completedMissions.filter(m => !m.startsWith('activity'));
        break;
      case 'all':
        users[userIndex].xp = 0;
        users[userIndex].level = 1;
        users[userIndex].quizScores = {};
        users[userIndex].examScores = {};
        users[userIndex].completedMissions = [];
        users[userIndex].submittedQuizzes = [];
        users[userIndex].submittedExams = [];
        break;
    }
    
    DB.saveUsers(users);
    showNotification('Score removed successfully!', 'success');
    loadTeacherDashboard();
  }
}

function changeTeacherPassword() {
  const newPassword = prompt('Enter new password (min. 6 characters):');
  if (!newPassword || newPassword.length < 6) {
    showNotification('Password must be at least 6 characters!', 'error');
    return;
  }
  
  const confirmPassword = prompt('Confirm new password:');
  if (newPassword !== confirmPassword) {
    showNotification('Passwords do not match!', 'error');
    return;
  }
  
  const newUsername = prompt('Enter new username (or keep current):', 'admin');
  if (!newUsername) {
    showNotification('Username cannot be empty!', 'error');
    return;
  }
  
  // Update in users array
  const users = DB.getUsers();
  const adminIndex = users.findIndex(u => u.role === 'teacher');
  if (adminIndex !== -1) {
    users[adminIndex].password = newPassword;
    users[adminIndex].username = newUsername;
    DB.saveUsers(users);
  }
  
  // Update current session
  const adminUser = DB.getCurrentUser();
  adminUser.password = newPassword;
  adminUser.username = newUsername;
  DB.setCurrentUser(adminUser);
  
  showNotification(`Credentials changed! Use ${newUsername} / ${newPassword} to login.`, 'success');
}

// ===== QUIZ START FUNCTION =====
function startQuiz(quizNumber) {
  // Block teachers from taking quizzes
  if (AppState.userRole === 'teacher') {
    showNotification('Teachers cannot take quizzes!', 'warning');
    return;
  }
  
  // Check if quiz is unlocked
  if (quizNumber > 1) {
    const prevQuizId = `quiz${quizNumber - 1}`;
    console.log('Checking unlock for quiz', quizNumber, 'Previous:', prevQuizId, 'Submitted:', AppState.submittedQuizzes);
    
    if (!AppState.submittedQuizzes.includes(prevQuizId)) {
      showNotification('Complete Quiz ' + (quizNumber - 1) + ' first!', 'warning');
      return;
    }
  }
  
  // Hide all quiz sections
  document.querySelectorAll('.quiz-section').forEach(section => {
    section.style.display = 'none';
  });
  
  // Show selected quiz
  const selectedQuiz = document.getElementById('quiz' + quizNumber);
  if (selectedQuiz) {
    selectedQuiz.style.display = 'block';
    selectedQuiz.scrollIntoView({ behavior: 'smooth' });
  }
}

// ===== EXPORT FUNCTIONS =====
window.registerStudent = registerStudent;
window.loginStudent = loginStudent;
window.loginTeacher = loginTeacher;
window.logout = logout;
window.completeMission = completeMission;
window.startExam = startExam;
window.startQuiz = startQuiz;
window.completeLesson = completeLesson;
window.completeActivity = completeActivity;
window.selectOption = selectOption;
window.answerTrueFalse = answerTrueFalse;
window.approveStudent = approveStudent;
window.rejectStudent = rejectStudent;
window.loadTeacherDashboard = loadTeacherDashboard;
window.viewStudentDetails = viewStudentDetails;
window.removeStudentScore = removeStudentScore;
window.changeTeacherPassword = changeTeacherPassword;