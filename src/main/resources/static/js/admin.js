/* Admin Command Center Script */

async function loadAdminData() {
    try {
        const stats = await apiCall('/admin/stats');
        document.getElementById('admin-stat-students').textContent = stats.totalStudents;
        document.getElementById('admin-stat-teachers').textContent = stats.totalTeachers;
        document.getElementById('admin-stat-classrooms').textContent = stats.totalClassrooms;
        document.getElementById('admin-stat-attendance-pct').textContent = stats.attendancePercentage + '%';

        loadAdminClassrooms();
        loadAdminSubjects();
        loadAdminUsers();
        loadAdminNotices();
    } catch (err) {
        showToast('Failed to load admin dashboard data', 'error');
    }
}

function switchAdminTab(tabName, btnEl) {
    document.querySelectorAll('#view-admin .tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('#view-admin .tab-content').forEach(c => c.classList.remove('active'));

    btnEl.classList.add('active');
    document.getElementById(`admin-tab-${tabName}`).classList.add('active');
}

async function loadAdminClassrooms() {
    try {
        const classrooms = await apiCall('/admin/classrooms');
        const tbody = document.getElementById('table-admin-classrooms');
        tbody.innerHTML = '';
        if (classrooms.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No classrooms added yet.</td></tr>`;
            return;
        }
        classrooms.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${c.roomName}</strong></td>
                <td>${c.building}</td>
                <td><code>${c.latitude}</code></td>
                <td><code>${c.longitude}</code></td>
                <td><span class="badge badge-success">${c.defaultRadiusMeters} meters</span></td>
                <td>
                    <button class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="deleteClassroom(${c.id})">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
    }
}

async function loadAdminSubjects() {
    try {
        const subjects = await apiCall('/admin/subjects');
        const tbody = document.getElementById('table-admin-subjects');
        tbody.innerHTML = '';
        if (subjects.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No subjects added yet.</td></tr>`;
            return;
        }
        subjects.forEach(s => {
            const teacherName = s.teacher ? s.teacher.user.fullName : 'Unassigned';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><code>${s.subjectCode}</code></td>
                <td><strong>${s.subjectName}</strong></td>
                <td>${s.department}</td>
                <td>${teacherName}</td>
                <td>
                    <button class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="deleteSubject(${s.id})">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
    }
}

async function loadAdminUsers() {
    try {
        const users = await apiCall('/admin/users');
        const tbody = document.getElementById('table-admin-users');
        tbody.innerHTML = '';
        users.forEach(u => {
            const dateStr = u.createdAt ? u.createdAt.substring(0, 10) : 'N/A';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${u.username}</strong></td>
                <td>${u.fullName}</td>
                <td>${u.email}</td>
                <td><span class="role-tag ${u.role.toLowerCase()}">${u.role}</span></td>
                <td>${dateStr}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
    }
}

async function loadAdminNotices() {
    try {
        const notices = await apiCall('/admin/notices');
        const tbody = document.getElementById('table-admin-notices');
        if (!tbody) return;
        tbody.innerHTML = '';
        if (notices.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No department announcements posted.</td></tr>`;
            return;
        }
        notices.forEach(n => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${n.title}</strong></td>
                <td style="font-size: 0.85rem; max-width: 300px;">${n.content}</td>
                <td>${n.postedBy}</td>
                <td>${n.createdAt ? n.createdAt.substring(0, 10) : ''}</td>
                <td>
                    <button class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="deleteNotice(${n.id})">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
    }
}

function openAddClassroomModal() { openModal('modal-add-classroom'); }
function openAddSubjectModal() { openModal('modal-add-subject'); }
function openAddNoticeModal() { openModal('modal-add-notice'); }

async function handleSaveClassroom(e) {
    e.preventDefault();
    const roomName = document.getElementById('modal-room-name').value.trim();
    const building = document.getElementById('modal-room-building').value.trim();
    const latitude = parseFloat(document.getElementById('modal-room-lat').value);
    const longitude = parseFloat(document.getElementById('modal-room-lon').value);
    const defaultRadiusMeters = parseFloat(document.getElementById('modal-room-radius').value);

    try {
        await apiCall('/admin/classrooms', 'POST', { roomName, building, latitude, longitude, defaultRadiusMeters });
        showToast('Classroom geofence saved successfully!', 'success');
        closeModal('modal-add-classroom');
        loadAdminClassrooms();
    } catch (err) {
        showToast(err.message || 'Failed to save classroom', 'error');
    }
}

async function handleSaveSubject(e) {
    e.preventDefault();
    const subjectCode = document.getElementById('modal-subject-code').value.trim();
    const subjectName = document.getElementById('modal-subject-name').value.trim();
    const department = document.getElementById('modal-subject-dept').value.trim();

    try {
        await apiCall('/admin/subjects', 'POST', { subjectCode, subjectName, department });
        showToast('Subject course created successfully!', 'success');
        closeModal('modal-add-subject');
        loadAdminSubjects();
    } catch (err) {
        showToast(err.message || 'Failed to save subject', 'error');
    }
}

async function handleSaveNotice(e) {
    e.preventDefault();
    const title = document.getElementById('modal-notice-title').value.trim();
    const content = document.getElementById('modal-notice-content').value.trim();
    const postedBy = STATE.currentUser ? STATE.currentUser.fullName : 'Admin';

    try {
        await apiCall('/admin/notices', 'POST', { title, content, postedBy });
        showToast('Announcement posted successfully!', 'success');
        closeModal('modal-add-notice');
        loadAdminNotices();
    } catch (err) {
        showToast(err.message || 'Failed to post notice', 'error');
    }
}

async function deleteClassroom(id) {
    if (!confirm('Are you sure you want to delete this classroom geofence?')) return;
    try {
        await apiCall(`/admin/classrooms/${id}`, 'DELETE');
        showToast('Classroom deleted', 'info');
        loadAdminClassrooms();
    } catch (err) {
        showToast('Failed to delete classroom', 'error');
    }
}

async function deleteSubject(id) {
    if (!confirm('Are you sure you want to delete this subject course?')) return;
    try {
        await apiCall(`/admin/subjects/${id}`, 'DELETE');
        showToast('Subject deleted', 'info');
        loadAdminSubjects();
    } catch (err) {
        showToast('Failed to delete subject', 'error');
    }
}

async function deleteNotice(id) {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    try {
        await apiCall(`/admin/notices/${id}`, 'DELETE');
        showToast('Notice deleted', 'info');
        loadAdminNotices();
    } catch (err) {
        showToast('Failed to delete notice', 'error');
    }
}
