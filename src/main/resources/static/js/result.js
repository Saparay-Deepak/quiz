document.addEventListener('DOMContentLoaded', function() {
    verifyAuthentication();
});

let category = '';
let resultData = null;

// Verify active authentication state
function verifyAuthentication() {
    fetch('/api/auth/status')
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                window.location.href = '/auth.html';
            } else {
                loadResultDetails();
            }
        })
        .catch(err => {
            console.error('Session verification failed:', err);
            window.location.href = '/auth.html';
        });
}

// Load session cached quiz result scorecard details
function loadResultDetails() {
    resultData = JSON.parse(sessionStorage.getItem('lastQuizResult'));
    category = sessionStorage.getItem('lastQuizCategory');

    if (!resultData) {
        showToast('No exam result found in session cache.', 'error');
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 1500);
        return;
    }

    // Populate Category Label
    document.getElementById('result-category-label').textContent = `${category} Exam Scorecard`;

    // Populate metrics list
    document.getElementById('metric-total').textContent = resultData.totalQuestions;
    document.getElementById('metric-correct').textContent = resultData.score;
    document.getElementById('metric-wrong').textContent = resultData.totalQuestions - resultData.score;

    // Set Greeting & Pass/Fail status visuals
    const greeting = document.getElementById('result-greeting');
    const badge = document.getElementById('result-status-badge');
    const scoreGauge = document.getElementById('score-gauge');
    const percentText = document.getElementById('score-percent-text');

    percentText.textContent = `${resultData.percentage}%`;
    badge.textContent = resultData.status;

    if (resultData.status === 'PASS') {
        greeting.textContent = 'Congratulations!';
        greeting.className = 'text-gradient-primary';
        badge.className = 'pill pill-pass';
        scoreGauge.setAttribute('stroke', 'var(--color-success)');
    } else {
        greeting.textContent = 'Keep Training!';
        greeting.style.color = 'var(--color-danger)';
        badge.className = 'pill pill-fail';
        scoreGauge.setAttribute('stroke', 'var(--color-danger)');
    }

    // Animate radial SVG gauge ring
    animateGauge(resultData.percentage);

    // Build the questions review list
    populateReviewPanel(resultData.feedbacks);

    // Clear loader
    document.getElementById('loader').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('loader').style.display = 'none';
    }, 500);
}

// Animate Circular SVG ring length
function animateGauge(percent) {
    const circle = document.getElementById('score-gauge');
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius; // 565.48
    
    // Set initial dash attributes
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;
    
    // Trigger paint cycle delay for smooth transition animation
    setTimeout(() => {
        const offset = circumference - (percent / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }, 100);
}

// Generate the 50-question explanation block
function populateReviewPanel(feedbacks) {
    const container = document.getElementById('questions-review-list');
    container.innerHTML = '';

    feedbacks.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'feedback-item';

        const isCorrect = item.selectedOption.toUpperCase() === item.correctOption.toUpperCase();
        const iconClass = isCorrect ? 'feedback-correct-icon' : 'feedback-wrong-icon';
        const iconSymbol = isCorrect ? '✓' : '✗';

        // Set up choices arrays
        const optionsText = [item.optionA, item.optionB, item.optionC, item.optionD];
        const optionLetters = ['A', 'B', 'C', 'D'];

        let optionsHtml = '';
        optionLetters.forEach((letter, oIdx) => {
            let optClass = '';
            
            // 1. User chose it and it's correct
            if (item.selectedOption === letter && isCorrect) {
                optClass = 'review-opt-selected-correct';
            } 
            // 2. User chose it but it's incorrect
            else if (item.selectedOption === letter && !isCorrect) {
                optClass = 'review-opt-selected-wrong';
            } 
            // 3. This option was actually correct (and user chose something else or left blank)
            else if (item.correctOption === letter) {
                optClass = 'review-opt-actual-correct';
            }

            optionsHtml += `
                <div class="review-opt ${optClass}">
                    <span style="font-weight:700;">${letter}.</span>
                    <span>${optionsText[oIdx]}</span>
                    ${item.selectedOption === letter ? '<span style="font-size:0.75rem; opacity:0.8; margin-left:auto;">(Your Choice)</span>' : ''}
                    ${item.correctOption === letter ? '<span style="font-size:0.75rem; opacity:0.8; margin-left:auto;">(Correct Answer)</span>' : ''}
                </div>`;
        });

        div.innerHTML = `
            <div class="feedback-header">
                <span class="feedback-q-text">
                    <span style="color:var(--secondary); font-weight:700;">Q${index + 1}.</span> 
                    ${item.questionText}
                </span>
                <div class="feedback-status-icon ${iconClass}">${iconSymbol}</div>
            </div>
            
            <div class="review-options">
                ${optionsHtml}
            </div>

            <div class="explanation-box">
                <strong style="color:var(--text-main); display:block; margin-bottom:0.4rem;">Topic Explanation:</strong>
                ${item.explanation || 'No explanation details available.'}
            </div>`;

        container.appendChild(div);
    });
}

// Redirect back to quiz simulator with targeted category parameters
function retryQuiz() {
    if (category) {
        window.location.href = `/quiz.html?category=${encodeURIComponent(category)}`;
    } else {
        window.location.href = '/dashboard.html';
    }
}

// Toast helper
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const symbol = type === 'success' ? '✓' : '✗';
    toast.innerHTML = `<span>${symbol}</span> <div>${message}</div>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s reverse forwards ease-in';
        setTimeout(() => { toast.remove(); }, 300);
    }, 4000);
}
