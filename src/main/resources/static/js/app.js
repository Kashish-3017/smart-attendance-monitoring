/* App Master Logic & State Management */
const STATE = {
    currentUser: null,
    activeTeacherSessionId: null,
    pollingInterval: null
};

document.addEventListener('DOMContentLoaded', () => {
    checkSavedSession();
});

function checkSavedSession() {
    const saved = localStorage.getItem('smart_attendance_user');
    if (saved) {
        try {
            STATE.currentUser = JSON.parse(saved);
            setupUIForRole(STATE.currentUser);
        } catch (e) {
            localStorage.removeItem('smart_attendance_user');
            showView('view-auth');
        }
    } else {
        showView('view-auth');
    }
}

function showView(viewId) {
    const views = ['view-auth', 'view-admin', 'view-teacher', 'view-student'];
    views.forEach(v => {
        const el = document.getElementById(v);
        if (el) el.style.display = (v === viewId) ? 'block' : 'none';
    });

    const navPanel = document.getElementById('nav-user-panel');
    if (viewId === 'view-auth') {
        if (navPanel) navPanel.style.display = 'none';
    } else {
        if (navPanel) navPanel.style.display = 'flex';
    }
}

function setupUIForRole(user) {
    const nameEl = document.getElementById('user-display-name');
    const roleTagEl = document.getElementById('user-role-tag');

    if (nameEl) nameEl.textContent = user.fullName || user.username;
    if (roleTagEl) {
        roleTagEl.textContent = user.role;
        roleTagEl.className = `role-tag ${user.role.toLowerCase()}`;
    }

    if (user.role === 'ADMIN') {
        showView('view-admin');
        loadAdminData();
    } else if (user.role === 'TEACHER') {
        showView('view-teacher');
        loadTeacherData();
    } else if (user.role === 'STUDENT') {
        showView('view-student');
        loadStudentData();
    }
}

function logout() {
    if (STATE.pollingInterval) {
        clearInterval(STATE.pollingInterval);
        STATE.pollingInterval = null;
    }
    STATE.currentUser = null;
    STATE.activeTeacherSessionId = null;
    localStorage.removeItem('smart_attendance_user');
    showView('view-auth');
    showToast('Logged out successfully', 'info');
}

// API Fetch Helper
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const res = await fetch(`/api${endpoint}`, options);
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || data.error || 'Server request failed');
        }
        return data;
    } catch (err) {
        console.error(`API Error [${endpoint}]:`, err);
        throw err;
    }
}

// Toast Notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-circle-xmark';
    if (type === 'warning') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Modal Helpers
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}
