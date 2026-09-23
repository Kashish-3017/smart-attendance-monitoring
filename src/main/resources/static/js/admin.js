/* Admin Command Center Script */

let adminTeachersList = [];
let adminSubjectsList = [];

async function loadAdminData() {
    try {
        const stats = await apiCall('/admin/stats');
        document.getElementById('admin-stat-students').textContent = stats.totalStudents;
        document.getElementById('admin-stat-teachers').textContent = stats.totalTeachers;
        document.getElementById('admin-stat-classrooms').textContent = stats.totalClassrooms;
        document.getElementById('admin-stat-attendance-pct').textContent = stats.attendancePercentage + '%';

        loadAdminClassrooms();
        loadAdminSubjects();
        loadAdminFaculty();
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
    const target = document.getElementById(`admin-tab-${tabName}`);
    if (target) target.classList.add('active');
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
        adminSubjectsList = await apiCall('/admin/subjects');
        try {
            adminTeachersList = await apiCall('/admin/teachers');
        } catch (e) {
            console.warn(e);
        }
        const tbody = document.getElementById('table-admin-subjects');
        tbody.innerHTML = '';
        if (adminSubjectsList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No subjects added yet.</td></tr>`;
            return;
        }
        adminSubjectsList.forEach(s => {
            let options = '<option value="">-- Unassigned --</option>';
            if (adminTeachersList && adminTeachersList.length > 0) {
                adminTeachersList.forEach(t => {
                    const isSelected = s.teacher && (s.teacher.id === t.id);
                    options += `<option value="${t.id}" ${isSelected ? 'selected' : ''}>${t.user ? t.user.fullName : 'Teacher'} (${t.employeeId})</option>`;
                });
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><code>${s.subjectCode}</code></td>
                <td><strong>${s.subjectName}</strong></td>
                <td>${s.department}</td>
                <td>
                    <select class="form-control" style="font-size: 0.8rem; padding: 0.3rem 0.5rem; max-width: 220px;" onchange="handleQuickAssignTeacher(${s.id}, this.value)">
                        ${options}
                    </select>
                </td>
                <td>
                    <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; margin-right: 0.3rem;" onclick="openEditSubjectModal(${s.id})">
                        <i class="fa-solid fa-pen-to-square"></i> Edit
                    </button>
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

async function handleQuickAssignTeacher(subjectId, teacherIdVal) {
    const teacherId = teacherIdVal ? parseInt(teacherIdVal) : 0;
    try {
        await apiCall(`/admin/subjects/${subjectId}/assign/${teacherId}`, 'POST');
        showToast('Subject teacher assignment updated successfully!', 'success');
        loadAdminFaculty();
    } catch (err) {
        showToast(err.message || 'Failed to update assignment', 'error');
        loadAdminSubjects();
    }
}

async function loadAdminFaculty() {
    try {
        adminTeachersList = await apiCall('/admin/teachers');
        const tbody = document.getElementById('table-admin-faculty');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (adminTeachersList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No faculty members registered yet.</td></tr>`;
            return;
        }

        const allSubjects = await apiCall('/admin/subjects');

        adminTeachersList.forEach(t => {
            const teacherSubjects = allSubjects.filter(s => s.teacher && s.teacher.id === t.id);
            let subBadges = teacherSubjects.map(s => `<span class="badge badge-success" style="font-size: 0.7rem; margin: 0.1rem;">${s.subjectCode} - ${s.subjectName}</span>`).join(' ');
            if (!subBadges) subBadges = '<span style="opacity: 0.6; font-size: 0.8rem;">No subjects assigned</span>';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><code>${t.employeeId}</code></td>
                <td><strong>${t.user ? t.user.fullName : 'Teacher'}</strong></td>
                <td>${t.user ? t.user.email : 'N/A'}</td>
                <td>${t.department}</td>
                <td>${subBadges}</td>
                <td>
                    <button class="btn btn-primary" style="padding: 0.25rem 0.6rem; font-size: 0.75rem;" onclick="openAssignTeacherModal(${t.id}, '${t.user ? t.user.fullName.replace(/'/g, "\\'") : 'Teacher'}')">
                        <i class="fa-solid fa-link"></i> Assign Subjects
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

async function openAddSubjectModal() {
    try {
        adminTeachersList = await apiCall('/admin/teachers');
        const select = document.getElementById('modal-subject-teacher');
        if (select) {
            select.innerHTML = '<option value="">-- Unassigned --</option>';
            adminTeachersList.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.id;
                opt.textContent = `${t.user ? t.user.fullName : 'Teacher'} (${t.employeeId})`;
                select.appendChild(opt);
            });
        }
    } catch (e) {
        console.error(e);
    }
    openModal('modal-add-subject');
}

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
    const teacherIdVal = document.getElementById('modal-subject-teacher').value;
    const teacherId = teacherIdVal ? parseInt(teacherIdVal) : null;

    try {
        await apiCall('/admin/subjects', 'POST', { subjectCode, subjectName, department, teacherId });
        showToast('Subject course created successfully!', 'success');
        closeModal('modal-add-subject');
        loadAdminSubjects();
        loadAdminFaculty();
    } catch (err) {
        showToast(err.message || 'Failed to save subject', 'error');
    }
}

async function openEditSubjectModal(subjectId) {
    try {
        const subjects = await apiCall('/admin/subjects');
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) return;

        adminTeachersList = await apiCall('/admin/teachers');
        const select = document.getElementById('modal-edit-subject-teacher');
        select.innerHTML = '<option value="">-- Unassigned --</option>';
        adminTeachersList.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.id;
            opt.textContent = `${t.user ? t.user.fullName : 'Teacher'} (${t.employeeId})`;
            select.appendChild(opt);
        });

        document.getElementById('modal-edit-subject-id').value = subject.id;
        document.getElementById('modal-edit-subject-code').value = subject.subjectCode;
        document.getElementById('modal-edit-subject-name').value = subject.subjectName;
        document.getElementById('modal-edit-subject-dept').value = subject.department;
        select.value = subject.teacher ? subject.teacher.id : '';

        openModal('modal-edit-subject');
    } catch (err) {
        showToast('Failed to load subject details', 'error');
    }
}

async function handleUpdateSubject(e) {
    e.preventDefault();
    const id = document.getElementById('modal-edit-subject-id').value;
    const subjectCode = document.getElementById('modal-edit-subject-code').value.trim();
    const subjectName = document.getElementById('modal-edit-subject-name').value.trim();
    const department = document.getElementById('modal-edit-subject-dept').value.trim();
    const teacherIdVal = document.getElementById('modal-edit-subject-teacher').value;
    const teacherId = teacherIdVal ? parseInt(teacherIdVal) : null;

    try {
        await apiCall(`/admin/subjects/${id}`, 'PUT', { subjectCode, subjectName, department, teacherId });
        showToast('Subject updated successfully!', 'success');
        closeModal('modal-edit-subject');
        loadAdminSubjects();
        loadAdminFaculty();
    } catch (err) {
        showToast(err.message || 'Failed to update subject', 'error');
    }
}

async function openAssignTeacherModal(teacherId, teacherName) {
    try {
        document.getElementById('modal-assign-teacher-id').value = teacherId;
        document.getElementById('modal-assign-teacher-name').textContent = teacherName;

        const allSubjects = await apiCall('/admin/subjects');
        const container = document.getElementById('modal-assign-subjects-checkboxes');
        container.innerHTML = '';

        if (allSubjects.length === 0) {
            container.innerHTML = '<div style="font-size: 0.85rem; color: var(--text-secondary);">No subjects available. Please add subjects first.</div>';
        } else {
            allSubjects.forEach(s => {
                const isAssigned = s.teacher && s.teacher.id === teacherId;
                const div = document.createElement('div');
                div.style.marginBottom = '0.4rem';
                div.style.display = 'flex';
                div.style.alignItems = 'center';
                div.style.gap = '0.5rem';

                div.innerHTML = `
                    <input type="checkbox" id="chk-sub-${s.id}" value="${s.id}" ${isAssigned ? 'checked' : ''} style="cursor: pointer;">
                    <label for="chk-sub-${s.id}" style="cursor: pointer; font-size: 0.9rem; margin-bottom: 0;">
                        <strong>${s.subjectCode}</strong> - ${s.subjectName} <span style="font-size: 0.75rem; color: var(--text-secondary);">(${s.department})</span>
                    </label>
                `;
                container.appendChild(div);
            });
        }

        openModal('modal-assign-teacher-subjects');
    } catch (err) {
        showToast('Failed to load subjects for assignment', 'error');
    }
}

async function handleSaveTeacherAssignments(e) {
    e.preventDefault();
    const teacherId = document.getElementById('modal-assign-teacher-id').value;
    const checkboxes = document.querySelectorAll('#modal-assign-subjects-checkboxes input[type="checkbox"]:checked');
    const subjectIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

    try {
        await apiCall(`/admin/teachers/${teacherId}/assign-subjects`, 'POST', subjectIds);
        showToast('Faculty subject assignments saved successfully!', 'success');
        closeModal('modal-assign-teacher-subjects');
        loadAdminFaculty();
        loadAdminSubjects();
    } catch (err) {
        showToast(err.message || 'Failed to save assignments', 'error');
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
        loadAdminFaculty();
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
