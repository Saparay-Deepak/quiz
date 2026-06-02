document.addEventListener('DOMContentLoaded', function() {
    // Secure page by checking auth status first
    verifyAuthentication();
});

let currentUser = null;

// Secure dashboard - redirect if session absent
function verifyAuthentication() {
    fetch('/api/auth/status')
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                window.location.href = '/auth.html';
            } else {
                currentUser = data.username;
                setupProfileHeader(currentUser);
                loadDashboardData();
            }
        })
        .catch(err => {
            console.error('Security verify failed:', err);
            window.location.href = '/auth.html';
        });
}

// Setup user names and letter avatars
function setupProfileHeader(username) {
    const firstChar = username.charAt(0).toUpperCase();
    document.getElementById('header-username').textContent = username;
    document.getElementById('welcome-username').textContent = username;
    document.getElementById('avatar-char').textContent = firstChar;
    document.getElementById('profile-avatar').textContent = firstChar;
}

// Main aggregate loader for dashboard elements
function loadDashboardData() {
    Promise.all([
        fetch('/api/quiz/history').then(res => res.json()),
        fetch('/api/leaderboard').then(res => res.json())
    ])
    .then(([history, leaderboard]) => {
        populateHistory(history);
        populateLeaderboard(leaderboard);
        calculateStats(history);
        
        // Hide loader overlay
        document.getElementById('loader').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loader').style.display = 'none';
        }, 500);
    })
    .catch(err => {
        console.error('Error loading dashboard data:', err);
        showToast('Failed to load dashboard data.', 'error');
        document.getElementById('loader').style.display = 'none';
    });
}

// Process and compile user aggregate statistics cards
function calculateStats(history) {
    const attempts = history.length;
    document.getElementById('stat-attempts').textContent = attempts;

    if (attempts === 0) {
        document.getElementById('stat-high-score').textContent = '0%';
        document.getElementById('stat-average-score').textContent = '0%';
        return;
    }

    // High Score
    const maxScore = Math.max(...history.map(a => a.percentage));
    document.getElementById('stat-high-score').textContent = `${maxScore}%`;

    // Pass ratio
    const passes = history.filter(a => a.status === 'PASS').length;
    const passRatio = Math.round((passes / attempts) * 100);
    document.getElementById('stat-average-score').textContent = `${passRatio}%`;
}

// Populate Personal Quiz Attempts table
function populateHistory(history) {
    const container = document.getElementById('history-container');
    if (!history || history.length === 0) {
        container.innerHTML = `
            <div class="empty-history">
                <p>No quiz attempts recorded yet.</p>
                <p style="font-size:0.85rem; margin-top:0.4rem;">Select a category card above to begin your journey!</p>
            </div>`;
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Category</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Status</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>`;

    history.forEach(attempt => {
        const dateStr = formatDate(attempt.attemptedAt);
        const pillClass = attempt.status === 'PASS' ? 'pill-pass' : 'pill-fail';
        html += `
            <tr>
                <td style="font-weight:600;">${attempt.category}</td>
                <td>${attempt.score} / ${attempt.totalQuestions}</td>
                <td>${attempt.percentage}%</td>
                <td><span class="pill ${pillClass}">${attempt.status}</span></td>
                <td style="font-size:0.85rem; color:var(--text-muted);">${dateStr}</td>
            </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

// Populate Public Top 10 Leaderboard table
function populateLeaderboard(leaderboard) {
    const container = document.getElementById('leaderboard-container');
    if (!leaderboard || leaderboard.length === 0) {
        container.innerHTML = `
            <div class="empty-history">
                <p>Leaderboard is currently empty.</p>
                <p style="font-size:0.85rem; margin-top:0.4rem;">Be the first to claim a rank!</p>
            </div>`;
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Warrior</th>
                    <th>Category</th>
                    <th>Score</th>
                    <th>Ratio</th>
                </tr>
            </thead>
            <tbody>`;

    leaderboard.forEach((entry, index) => {
        const rank = index + 1;
        let rankSymbol = rank;
        let rankClass = '';
        
        if (rank === 1) {
            rankSymbol = '🥇';
            rankClass = 'rank-1';
        } else if (rank === 2) {
            rankSymbol = '🥈';
            rankClass = 'rank-2';
        } else if (rank === 3) {
            rankSymbol = '🥉';
            rankClass = 'rank-3';
        }

        const isSelf = entry.username === currentUser ? 'background: rgba(0, 242, 254, 0.08); font-weight: 500;' : '';

        html += `
            <tr style="${isSelf}">
                <td class="${rankClass}" style="text-align:center; font-size:1.1rem; width: 60px;">${rankSymbol}</td>
                <td style="font-weight:600;">${entry.username} ${entry.username === currentUser ? '<span style="color:var(--secondary); font-size:0.75rem;">(You)</span>' : ''}</td>
                <td>${entry.category}</td>
                <td>${entry.score} / ${entry.totalQuestions}</td>
                <td style="font-weight:600; color:var(--secondary);">${entry.percentage}%</td>
            </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

// Format LocalDateTime array/string to standard date/time format
function formatDate(dateArrOrStr) {
    if (!dateArrOrStr) return 'N/A';
    
    let dateObj;
    if (Array.isArray(dateArrOrStr)) {
        // Spring Boot LocalDateTime maps to array sometimes in JSON [year, month, day, hour, minute, second]
        const [year, month, day, hour, minute] = dateArrOrStr;
        dateObj = new Date(year, month - 1, day, hour, minute);
    } else {
        dateObj = new Date(dateArrOrStr);
    }

    return dateObj.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Log out of the system
function handleLogout() {
    fetch('/api/auth/logout', {
        method: 'POST'
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/auth.html';
        } else {
            showToast('Logout failed. Please try again.', 'error');
        }
    })
    .catch(err => {
        console.error('Logout error:', err);
        window.location.href = '/auth.html';
    });
}

// Helper toast launcher
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
