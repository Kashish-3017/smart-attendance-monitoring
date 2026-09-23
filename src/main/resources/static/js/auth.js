/* Authentication Logic */

function fillDemoAccount(username, password) {
    document.getElementById('login-username').value = username;
    document.getElementById('login-password').value = password;
    showToast(`Filled credentials for ${username}`, 'info');
}

function toggleAuthForm(e) {
    if (e) e.preventDefault();
    const loginForm = document.getElementById('form-login');
    const regForm = document.getElementById('form-register');
    const title = document.getElementById('auth-title');
    const toggleText = document.getElementById('toggle-auth-text');
    const toggleAction = document.getElementById('toggle-auth-action');

    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        regForm.style.display = 'none';
        title.textContent = 'Sign In to Your Account';
        toggleText.textContent = "Don't have an account?";
        toggleAction.textContent = 'Register Now';
    } else {
        loginForm.style.display = 'none';
        regForm.style.display = 'block';
        title.textContent = 'Create New System Account';
        toggleText.textContent = 'Already have an account?';
        toggleAction.textContent = 'Login';
    }
}

function toggleRegisterFields() {
    const role = document.getElementById('reg-role').value;
    const studentFields = document.getElementById('reg-student-fields');
    const teacherFields = document.getElementById('reg-teacher-fields');

    if (role === 'STUDENT') {
        studentFields.style.display = 'block';
        teacherFields.style.display = 'none';
    } else if (role === 'TEACHER') {
        studentFields.style.display = 'none';
        teacherFields.style.display = 'block';
    } else if (role === 'ADMIN') {
        studentFields.style.display = 'none';
        teacherFields.style.display = 'none';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    try {
        const response = await apiCall('/auth/login', 'POST', { username, password });
        if (response.success) {
            STATE.currentUser = response;
            localStorage.setItem('smart_attendance_user', JSON.stringify(response));
            showToast(`Welcome back, ${response.fullName}!`, 'success');
            setupUIForRole(response);
        } else {
            showToast(response.message || 'Login failed', 'error');
        }
    } catch (err) {
        showToast(err.message || 'Login failed', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const role = document.getElementById('reg-role').value;
    const fullName = document.getElementById('reg-fullname').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const rollNumber = document.getElementById('reg-roll').value.trim();
    const employeeId = document.getElementById('reg-empid').value.trim();
    const department = document.getElementById('reg-dept').value.trim();

    const payload = {
        role, fullName, email, username, password, rollNumber, employeeId, department
    };

    try {
        const response = await apiCall('/auth/register', 'POST', payload);
        if (response.success) {
            showToast(response.message, 'success');
            toggleAuthForm();
            fillDemoAccount(username, password);
        } else {
            showToast(response.message || 'Registration failed', 'error');
        }
    } catch (err) {
        showToast(err.message || 'Registration failed', 'error');
    }
}
