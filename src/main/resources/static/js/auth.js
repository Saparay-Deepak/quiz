document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already authenticated on startup
    checkAuthStatus();
});

// Helper for displaying stunning float notifications
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Add symbol based on type
    const symbol = type === 'success' ? '✓' : '✗';
    toast.innerHTML = `<span>${symbol}</span> <div>${message}</div>`;
    
    container.appendChild(toast);
    
    // Animate out and remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s reverse forwards ease-in';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4000);
}

// Check session authentication status
function checkAuthStatus() {
    fetch('/api/auth/status')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Already logged in, proceed straight to the dashboard!
                window.location.href = '/dashboard.html';
            } else {
                // Not authenticated, hide the loader to show the form
                document.getElementById('loader').style.opacity = '0';
                setTimeout(() => {
                    document.getElementById('loader').style.display = 'none';
                }, 500);
            }
        })
        .catch(err => {
            console.error('Session check failed:', err);
            document.getElementById('loader').style.display = 'none';
        });
}

// Fluid transition between Login and Register tabs
function switchTab(tab) {
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');
    const footerText = document.getElementById('auth-footer-text');

    if (tab === 'login') {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        formLogin.classList.add('active');
        formRegister.classList.remove('active');
        footerText.innerHTML = `Don't have an account? <a href="javascript:void(0)" onclick="switchTab('register')">Sign Up Free</a>`;
    } else {
        tabLogin.classList.remove('active');
        tabRegister.classList.add('active');
        formLogin.classList.remove('active');
        formRegister.classList.add('active');
        footerText.innerHTML = `Already have an account? <a href="javascript:void(0)" onclick="switchTab('login')">Log In here</a>`;
    }
}

// REST AJAX Login submit handler
function handleLogin(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('login-username').value;
    const passwordInput = document.getElementById('login-password').value;

    fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: usernameInput,
            password: passwordInput
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast('Authentication successful! Welcome to the Arena.', 'success');
            // Brief pause to allow the toast to be readable before loading dashboard
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1000);
        } else {
            showToast(data.message || 'Invalid username or password.', 'error');
        }
    })
    .catch(err => {
        console.error('Login error:', err);
        showToast('Server connection failed. Please try again.', 'error');
    });
}

// REST AJAX Register submit handler
function handleRegister(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('register-username').value;
    const emailInput = document.getElementById('register-email').value;
    const passwordInput = document.getElementById('register-password').value;

    fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: usernameInput,
            email: emailInput,
            password: passwordInput
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast(data.message, 'success');
            // Switch to login tab and prefill the newly registered username
            setTimeout(() => {
                switchTab('login');
                document.getElementById('login-username').value = usernameInput;
                document.getElementById('login-password').value = '';
                // Clear the registration form fields
                document.getElementById('register-username').value = '';
                document.getElementById('register-email').value = '';
                document.getElementById('register-password').value = '';
            }, 1500);
        } else {
            showToast(data.message || 'Registration failed.', 'error');
        }
    })
    .catch(err => {
        console.error('Registration error:', err);
        showToast('Server connection failed. Please try again.', 'error');
    });
}
