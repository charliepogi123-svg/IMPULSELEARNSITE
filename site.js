const IMPULSELEARN_USER_KEY = 'impulselearn-user';

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem(IMPULSELEARN_USER_KEY) || 'null');
    } catch (error) {
        return null;
    }
}

function requireLogin(requiredRole) {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    if (requiredRole && user.role !== requiredRole) {
        const redirectPage = user.role === 'Teacher' ? 'teacher-dashboard.html' : 'student-dashboard.html';
        window.location.href = redirectPage;
        return null;
    }
    const nameEl = document.querySelector('.user-name');
    const roleEl = document.querySelector('.user-role');
    if (nameEl) nameEl.textContent = user.name;
    if (roleEl) roleEl.textContent = user.role;
    const avatarEls = document.querySelectorAll('.user-avatar');
    avatarEls.forEach((el) => {
        el.textContent = user.name.split(' ').map((part) => part[0] || '').slice(0, 2).join('').toUpperCase();
    });
    setActiveNav();
    return user;
}

function setActiveNav() {
    const path = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-link').forEach((link) => {
        if (link.getAttribute('href') === path) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function logout() {
    localStorage.removeItem(IMPULSELEARN_USER_KEY);
    window.location.href = 'index.html';
}

function saveProgress(key, value) {
    localStorage.setItem(`impulselearn-progress-${key}`, JSON.stringify(value));
}

function loadProgress(key, defaultValue) {
    const raw = localStorage.getItem(`impulselearn-progress-${key}`);
    return raw ? JSON.parse(raw) : defaultValue;
}

function markMissionComplete(id) {
    const missions = loadProgress('missions', {});
    missions[id] = true;
    saveProgress('missions', missions);
    renderMissionStatus();
}

function renderMissionStatus() {
    const missions = loadProgress('missions', {});
    document.querySelectorAll('.mission-card').forEach((card) => {
        const missionId = card.dataset.missionId;
        if (missions[missionId]) {
            card.classList.add('completed');
            card.querySelector('.mission-status').textContent = 'Completed';
            card.querySelector('.mission-action').textContent = 'Done';
            card.querySelector('.mission-action').disabled = true;
        }
    });
    const completed = Object.keys(missions).length;
    const xp = 150 + completed * 50;
    const total = 4;
    const progressBar = document.querySelector('.mission-progress-bar');
    if (progressBar) {
        progressBar.style.width = `${Math.min(100, (completed / total) * 100)}%`;
    }
    const progressText = document.querySelector('.mission-progress-text');
    if (progressText) {
        progressText.textContent = `${completed} / ${total} missions completed`;
    }
    const xpText = document.querySelector('.mission-xp');
    if (xpText) {
        xpText.textContent = `${xp} XP`;
    }
}

function initMissionPage() {
    requireLogin();
    renderMissionStatus();
}

function initQuizPage() {
    requireLogin();
    const quizSelect = document.getElementById('quizSelect');
    const quizData = window.quizData || [];
    if (!quizSelect || !quizData.length) return;
    quizSelect.addEventListener('change', () => {
        renderQuiz(quizData[quizSelect.selectedIndex]);
    });
    renderQuiz(quizData[0]);
}

function renderQuiz(quiz) {
    const quizTitle = document.getElementById('quizTitle');
    const quizContent = document.getElementById('quizContent');
    const quizForm = document.getElementById('quizForm');
    if (!quizTitle || !quizContent || !quizForm) return;
    quizTitle.textContent = quiz.title;
    quizContent.innerHTML = quiz.questions.map((question, index) => {
        const options = question.options.map((option, optionIndex) => `
            <label class="radio-item"><input type="radio" name="q${index}" value="${optionIndex}"> ${option}</label>
        `).join('');
        return `
            <div class="question-block">
                <div class="question-label"><strong>${index + 1}.</strong> ${question.text}</div>
                <div class="options-grid">${options}</div>
            </div>
        `;
    }).join('');
    quizForm.onsubmit = (event) => {
        event.preventDefault();
        let score = 0;
        const feedback = [];
        quiz.questions.forEach((question, index) => {
            const selected = quizForm.querySelector(`input[name="q${index}"]:checked`);
            const answerIndex = selected ? parseInt(selected.value, 10) : -1;
            if (answerIndex === question.answer) {
                score += 1;
            } else {
                feedback.push(`Question ${index + 1}: Correct answer is "${question.options[question.answer]}".`);
            }
        });
        const result = document.getElementById('quizResult');
        if (result) {
            result.innerHTML = `
                <div class="result-box">
                    <h3>Score: ${score} / ${quiz.questions.length}</h3>
                    <p>${score >= quiz.questions.length * 0.8 ? 'Great job! You understand momentum and impulse well.' : 'Keep practicing and review the lessons to improve.'}</p>
                    ${feedback.length ? `<details><summary>Review incorrect answers</summary><ul>${feedback.map(item => `<li>${item}</li>`).join('')}</ul></details>` : '<p>All answers are correct.</p>'}
                </div>
            `;
        }
        window.scrollTo({ top: result.offsetTop - 24, behavior: 'smooth' });
    };
}

function initExamPage() {
    requireLogin();
    const examSelect = document.getElementById('examSelect');
    const examData = window.examData || [];
    if (!examSelect || !examData.length) return;
    examSelect.addEventListener('change', () => {
        renderExam(examData[examSelect.selectedIndex]);
    });
    renderExam(examData[0]);
}

function renderExam(exam) {
    const examTitle = document.getElementById('examTitle');
    const examContent = document.getElementById('examContent');
    const examForm = document.getElementById('examForm');
    if (!examTitle || !examContent || !examForm) return;
    examTitle.textContent = exam.title;
    examContent.innerHTML = exam.questions.map((question, index) => {
        const options = question.options.map((option, optionIndex) => `
            <label class="radio-item"><input type="radio" name="q${index}" value="${optionIndex}"> ${option}</label>
        `).join('');
        return `
            <div class="question-block">
                <div class="question-label"><strong>${index + 1}.</strong> ${question.text}</div>
                <div class="options-grid">${options}</div>
            </div>
        `;
    }).join('');
    examForm.onsubmit = (event) => {
        event.preventDefault();
        let score = 0;
        const feedback = [];
        exam.questions.forEach((question, index) => {
            const selected = examForm.querySelector(`input[name="q${index}"]:checked`);
            const answerIndex = selected ? parseInt(selected.value, 10) : -1;
            if (answerIndex === question.answer) {
                score += 1;
            } else {
                feedback.push(`Q${index + 1}: Correct answer is "${question.options[question.answer]}".`);
            }
        });
        const result = document.getElementById('examResult');
        if (result) {
            result.innerHTML = `
                <div class="result-box">
                    <h3>Final Score: ${score} / ${exam.questions.length}</h3>
                    <p>${score >= exam.questions.length * 0.7 ? 'Exam complete — you are ready for the next challenge!' : 'Review the lessons and try again to raise your score.'}</p>
                    <details><summary>Correct answers review</summary><ul>${feedback.map(item => `<li>${item}</li>`).join('')}</ul></details>
                </div>
            `;
        }
        window.scrollTo({ top: result.offsetTop - 24, behavior: 'smooth' });
    };
}

function initSimulationPage() {
    requireLogin();
    const canvas = document.getElementById('simulationCanvas');
    if (!canvas || !window.THREE) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    camera.position.set(0, 2.4, 6);
    const light = new THREE.DirectionalLight(0xffffff, 1.1);
    light.position.set(5, 10, 7);
    scene.add(light);
    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ color: 0x11172a, roughness: 0.8, metalness: 0.1 }));
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const sphereA = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 32), new THREE.MeshStandardMaterial({ color: 0x36c2ff, metalness: 0.5, roughness: 0.2 }));
    const sphereB = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 32), new THREE.MeshStandardMaterial({ color: 0xff9a6b, metalness: 0.5, roughness: 0.2 }));
    sphereA.position.set(-2.5, 0.7, 0);
    sphereB.position.set(2.5, 0.7, 0);
    scene.add(sphereA, sphereB);

    const trailA = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x36c2ff, transparent: true, opacity: 0.7 }));
    const trailB = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xff9a6b, transparent: true, opacity: 0.7 }));
    scene.add(trailA, trailB);

    let velocityA = 2.2;
    let velocityB = -1.0;
    let massA = 4;
    let massB = 2;
    let forceValue = 18;
    let contactTime = 1.1;
    let running = false;

    const sliders = {
        massA: document.getElementById('massA'),
        velocityA: document.getElementById('velocityA'),
        massB: document.getElementById('massB'),
        velocityB: document.getElementById('velocityB'),
        force: document.getElementById('force'),
        time: document.getElementById('time'),
    };
    const outputs = {
        massA: document.getElementById('massAValue'),
        velocityA: document.getElementById('velocityAValue'),
        massB: document.getElementById('massBValue'),
        velocityB: document.getElementById('velocityBValue'),
        force: document.getElementById('forceValue'),
        time: document.getElementById('timeValue'),
        momentumA: document.getElementById('momentumA'),
        momentumB: document.getElementById('momentumB'),
        impulse: document.getElementById('impulseValue'),
    };

    function updateValues() {
        massA = parseFloat(sliders.massA.value);
        velocityA = parseFloat(sliders.velocityA.value);
        massB = parseFloat(sliders.massB.value);
        velocityB = parseFloat(sliders.velocityB.value);
        forceValue = parseFloat(sliders.force.value);
        contactTime = parseFloat(sliders.time.value);
        outputs.massA.textContent = `${massA.toFixed(1)} kg`;
        outputs.velocityA.textContent = `${velocityA.toFixed(1)} m/s`;
        outputs.massB.textContent = `${massB.toFixed(1)} kg`;
        outputs.velocityB.textContent = `${velocityB.toFixed(1)} m/s`;
        outputs.force.textContent = `${forceValue.toFixed(0)} N`;
        outputs.time.textContent = `${contactTime.toFixed(1)} s`;
        const momentumA = massA * velocityA;
        const momentumB = massB * velocityB;
        const impulse = forceValue * contactTime;
        outputs.momentumA.textContent = `${momentumA.toFixed(1)} kg·m/s`;
        outputs.momentumB.textContent = `${momentumB.toFixed(1)} kg·m/s`;
        outputs.impulse.textContent = `${impulse.toFixed(1)} N·s`;
    }

    Object.values(sliders).forEach((slider) => {
        slider.addEventListener('input', updateValues);
    });

    document.getElementById('startSim').addEventListener('click', () => {
        running = true;
        sphereA.position.set(-2.5, 0.7, 0);
        sphereB.position.set(2.5, 0.7, 0);
    });

    function animate() {
        requestAnimationFrame(animate);
        if (running) {
            sphereA.position.x += velocityA * 0.01;
            sphereB.position.x += velocityB * 0.01;
            if (sphereA.position.x + 0.8 >= sphereB.position.x - 0.8) {
                const totalMomentum = massA * velocityA + massB * velocityB;
                const combinedVelocity = totalMomentum / (massA + massB);
                velocityA = combinedVelocity;
                velocityB = combinedVelocity;
                forceValue = Math.abs(totalMomentum) * 2;
                updateValues();
                running = false;
            }
            const positionsA = new Float32Array([sphereA.position.x, sphereA.position.y, sphereA.position.z, sphereA.position.x - 0.2, sphereA.position.y, sphereA.position.z]);
            const positionsB = new Float32Array([sphereB.position.x, sphereB.position.y, sphereB.position.z, sphereB.position.x + 0.2, sphereB.position.y, sphereB.position.z]);
            trailA.geometry.setAttribute('position', new THREE.BufferAttribute(positionsA, 3));
            trailB.geometry.setAttribute('position', new THREE.BufferAttribute(positionsB, 3));
        }
        renderer.render(scene, camera);
    }

    updateValues();
    animate();
}

function initSimulationCanvasResize() {
    const canvas = document.getElementById('simulationCanvas');
    if (!canvas || !window.THREE) return;
    window.addEventListener('resize', () => {
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    });
}

function initPage(page, requiredRole) {
    requireLogin(requiredRole);
    if (page === 'mission') initMissionPage();
    if (page === 'quiz') initQuizPage();
    if (page === 'exam') initExamPage();
    if (page === 'simulation') initSimulationPage();
}

window.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page;
    if (page) {
        initPage(page);
    }
});
