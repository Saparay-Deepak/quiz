document.addEventListener('DOMContentLoaded', function() {
    verifyAuthentication();
});

let category = '';
let questions = [];
let currentIndex = 0;
let answers = {}; // Maps questionId -> selectedOption ("A", "B", "C", "D")
let markedForReview = {}; // Maps questionId -> boolean
let timerSecs = 50 * 60; // 50 minutes in seconds
let timerInterval = null;

// Verify user authentication
function verifyAuthentication() {
    fetch('/api/auth/status')
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                window.location.href = '/auth.html';
            } else {
                extractCategory();
            }
        })
        .catch(err => {
            console.error('Session verification failed:', err);
            window.location.href = '/auth.html';
        });
}

// Extract Category from URL query parameters
function extractCategory() {
    const params = new URLSearchParams(window.location.search);
    category = params.get('category');
    
    if (!category) {
        showToast('Invalid quiz category selection!', 'error');
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 1500);
        return;
    }

    // Set header category title
    document.getElementById('category-title').textContent = `${category} Exam Arena`;
    loadQuestions();
}

// Fetch 50 questions from backend REST API
function loadQuestions() {
    fetch(`/api/quiz/questions?category=${encodeURIComponent(category)}`)
        .then(res => {
            if (!res.ok) throw new Error('Failed to load questions');
            return res.json();
        })
        .then(data => {
            if (!data || data.length === 0) {
                showToast('No questions found for this category.', 'error');
                setTimeout(() => { window.location.href = '/dashboard.html'; }, 1500);
                return;
            }
            questions = data;
            
            // Build the right-side Navigator bubbles
            generateNavigatorBubbles(questions.length);
            
            // Render the first question
            renderQuestion(0);
            
            // Start the counting timer
            startTimer();

            // Hide page loader
            document.getElementById('loader').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('loader').style.display = 'none';
            }, 500);
        })
        .catch(err => {
            console.error('Error loading questions:', err);
            showToast('Server connection failed.', 'error');
            document.getElementById('loader').style.display = 'none';
        });
}

// Generate the 50 sidebar bubble buttons
function generateNavigatorBubbles(count) {
    const grid = document.getElementById('navigation-bubble-grid');
    grid.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const bubble = document.createElement('button');
        bubble.className = 'bubble';
        bubble.id = `bubble-${i}`;
        bubble.textContent = i + 1;
        bubble.onclick = () => jumpToQuestion(i);
        grid.appendChild(bubble);
    }
}

// Render the active question by index
function renderQuestion(index) {
    // Save current active bubble state (remove 'active' class from old, apply to new)
    document.getElementById(`bubble-${currentIndex}`).classList.remove('active');
    
    currentIndex = index;
    
    // Set active class on active bubble
    document.getElementById(`bubble-${currentIndex}`).classList.add('active');

    const question = questions[currentIndex];
    
    // Update counters and progress bar
    document.getElementById('question-index-counter').textContent = `QUESTION ${currentIndex + 1} OF ${questions.length}`;
    
    const progressPercent = ((currentIndex + 1) / questions.length) * 100;
    document.getElementById('progress-bar-fill').style.width = `${progressPercent}%`;

    // Render text
    document.getElementById('question-text-box').textContent = question.questionText;

    // Render option contents
    const optionButtons = document.querySelectorAll('#options-buttons-grid .option-btn');
    const optionsText = [question.optionA, question.optionB, question.optionC, question.optionD];
    const optionLetters = ['A', 'B', 'C', 'D'];

    optionButtons.forEach((btn, idx) => {
        btn.className = 'option-btn'; // Reset
        btn.querySelector('.option-content').textContent = optionsText[idx];
        
        // Mark if selected
        const activeAns = answers[question.id];
        if (activeAns === optionLetters[idx]) {
            btn.classList.add('selected');
        }
    });

    // Update navigation control buttons
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnMark = document.getElementById('btn-mark');

    // Disable/Enable Prev
    if (currentIndex === 0) {
        btnPrev.style.opacity = '0.5';
        btnPrev.style.pointerEvents = 'none';
    } else {
        btnPrev.style.opacity = '1';
        btnPrev.style.pointerEvents = 'auto';
    }

    // Toggle Next button text on last question
    if (currentIndex === questions.length - 1) {
        btnNext.textContent = 'Finish Exam';
    } else {
        btnNext.textContent = 'Next →';
    }

    // Highlight Mark for Review toggle
    if (markedForReview[question.id]) {
        btnMark.style.background = 'hsl(290, 80%, 55%)';
        btnMark.style.color = 'var(--text-main)';
    } else {
        btnMark.style.background = 'transparent';
        btnMark.style.color = 'hsl(290, 80%, 75%)';
    }

    updateAnsweredCount();
}

// Option selection action
function selectOption(letter) {
    const question = questions[currentIndex];
    
    // Save answer
    answers[question.id] = letter;

    // Re-render question card options styling
    const optionButtons = document.querySelectorAll('#options-buttons-grid .option-btn');
    const optionLetters = ['A', 'B', 'C', 'D'];

    optionButtons.forEach((btn, idx) => {
        btn.classList.remove('selected');
        if (optionLetters[idx] === letter) {
            btn.classList.add('selected');
        }
    });

    // Update navigator bubble colors
    const bubble = document.getElementById(`bubble-${currentIndex}`);
    
    // If marked for review, keep purple class, else set green
    if (markedForReview[question.id]) {
        bubble.className = 'bubble marked active';
    } else {
        bubble.className = 'bubble answered active';
    }

    updateAnsweredCount();
}

// Clear selected choice
function clearSelection() {
    const question = questions[currentIndex];
    delete answers[question.id];

    // Reset button elements
    const optionButtons = document.querySelectorAll('#options-buttons-grid .option-btn');
    optionButtons.forEach(btn => btn.classList.remove('selected'));

    // Reset navigator bubble color
    const bubble = document.getElementById(`bubble-${currentIndex}`);
    if (markedForReview[question.id]) {
        bubble.className = 'bubble marked active';
    } else {
        bubble.className = 'bubble active';
    }

    updateAnsweredCount();
}

// Toggle Mark for Review flag
function toggleMarkForReview() {
    const question = questions[currentIndex];
    markedForReview[question.id] = !markedForReview[question.id];

    const bubble = document.getElementById(`bubble-${currentIndex}`);
    const btnMark = document.getElementById('btn-mark');

    if (markedForReview[question.id]) {
        bubble.classList.add('marked');
        bubble.classList.remove('answered');
        btnMark.style.background = 'hsl(290, 80%, 55%)';
        btnMark.style.color = 'var(--text-main)';
    } else {
        bubble.classList.remove('marked');
        btnMark.style.background = 'transparent';
        btnMark.style.color = 'hsl(290, 80%, 75%)';
        
        // If an answer is selected, mark as green answered
        if (answers[question.id]) {
            bubble.classList.add('answered');
        }
    }
}

// Go to next question
function nextQuestion() {
    if (currentIndex < questions.length - 1) {
        renderQuestion(currentIndex + 1);
    } else {
        // Last question clicked - launch submission confirmation
        triggerSubmitConfirmation();
    }
}

// Go to previous question
function prevQuestion() {
    if (currentIndex > 0) {
        renderQuestion(currentIndex - 1);
    }
}

// Jump directly to targeted question by navigator click
function jumpToQuestion(index) {
    if (index >= 0 && index < questions.length) {
        renderQuestion(index);
    }
}

// Countdown timer loop
function startTimer() {
    timerInterval = setInterval(() => {
        timerSecs--;
        
        // Format
        const minutes = Math.floor(timerSecs / 60);
        const seconds = timerSecs % 60;
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const display = document.getElementById('timer-display');
        display.textContent = timeStr;

        // Warning at 5 minutes
        if (timerSecs <= 300) {
            display.classList.add('timer-warning');
        }

        // Time up
        if (timerSecs <= 0) {
            clearInterval(timerInterval);
            showToast("Time's up! Automatically submitting your paper for scoring.", 'error');
            setTimeout(() => {
                submitExam();
            }, 1500);
        }
    }, 1000);
}

// Count remaining uncompleted questions
function updateAnsweredCount() {
    const answeredKeys = Object.keys(answers);
    const count = answeredKeys.length;
    document.getElementById('unanswered-count-badge').textContent = `${count} / ${questions.length} Answered`;
}

// Quit warning validation
function confirmExit() {
    document.getElementById('exit-modal').style.display = 'flex';
    document.getElementById('exit-modal').style.opacity = '1';
}

function exitToDashboard() {
    clearInterval(timerInterval);
    window.location.href = '/dashboard.html';
}

// Submit validation overlay trigger
function triggerSubmitConfirmation() {
    const totalAns = Object.keys(answers).length;
    const unanswered = questions.length - totalAns;

    const desc = document.getElementById('submit-modal-description');
    if (unanswered > 0) {
        desc.innerHTML = `You are submitting your exam for scoring.<br><br><span style="color:var(--color-danger); font-weight:bold;">Warning: You have ${unanswered} unanswered questions!</span><br>Unanswered questions receive 0 points.`;
    } else {
        desc.innerHTML = `All ${questions.length} questions completed!<br><br>Ready to submit your paper and evaluate your score?`;
    }

    document.getElementById('submit-modal').style.display = 'flex';
    document.getElementById('submit-modal').style.opacity = '1';
}

// Close overlays helper
function closeModal(id) {
    document.getElementById(id).style.opacity = '0';
    setTimeout(() => {
        document.getElementById(id).style.display = 'none';
    }, 300);
}

// Post final responses to backend server and evaluate
function submitExam() {
    closeModal('submit-modal');
    
    // Show overlay spinner
    document.getElementById('loader').style.display = 'flex';
    document.getElementById('loader').style.opacity = '1';
    document.querySelector('#loader p').textContent = 'Scoring your answers...';

    clearInterval(timerInterval);

    // Prepare submit payload
    const submission = {
        category: category,
        answers: answers
    };

    fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(submission)
    })
    .then(res => {
        if (!res.ok) throw new Error('Submission failed');
        return res.json();
    })
    .then(resultDto => {
        // Save detailed results in SessionStorage to present in result.html
        sessionStorage.setItem('lastQuizResult', JSON.stringify(resultDto));
        sessionStorage.setItem('lastQuizCategory', category);
        
        showToast('Exam submitted successfully!', 'success');
        setTimeout(() => {
            window.location.href = '/result.html';
        }, 1200);
    })
    .catch(err => {
        console.error('Submit error:', err);
        showToast('Failed to submit answers. Re-establishing connection...', 'error');
        document.getElementById('loader').style.display = 'none';
    });
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
