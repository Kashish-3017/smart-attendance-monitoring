/* Teacher View Script */

let teacherClassroomsMap = {};
let sessionCountdownInterval = null;

async function loadTeacherData() {
    if (!STATE.currentUser || !STATE.currentUser.roleEntityId) return;

    try {
        const teacherId = STATE.currentUser.roleEntityId;
        const subjects = await apiCall(`/teacher/subjects/${teacherId}`);
        const classrooms = await apiCall('/teacher/classrooms');

        // Populate Subject Select Dropdown
        const subSelect = document.getElementById('teacher-select-subject');
        subSelect.innerHTML = '';
        if (subjects.length === 0) {
            subSelect.innerHTML = `<option value="">No subjects assigned to you</option>`;
        } else {
            subjects.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = `${s.subjectCode} - ${s.subjectName}`;
                subSelect.appendChild(opt);
            });
        }

        // Populate Classroom Select Dropdown
        const roomSelect = document.getElementById('teacher-select-classroom');
        roomSelect.innerHTML = '';
        teacherClassroomsMap = {};

        if (classrooms.length === 0) {
            roomSelect.innerHTML = `<option value="">No classrooms configured</option>`;
        } else {
            classrooms.forEach(c => {
                teacherClassroomsMap[c.id] = c;
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = `${c.roomName} (${c.building})`;
                roomSelect.appendChild(opt);
            });
            updateClassroomCoordsPreview();
        }

        checkActiveTeacherSession();
    } catch (err) {
        showToast('Failed to load teacher control dashboard', 'error');
    }
}

function updateClassroomCoordsPreview() {
    const roomId = document.getElementById('teacher-select-classroom').value;
    if (roomId && teacherClassroomsMap[roomId]) {
        const room = teacherClassroomsMap[roomId];
        document.getElementById('session-lat').value = room.latitude;
        document.getElementById('session-lon').value = room.longitude;
        document.getElementById('session-radius').value = room.defaultRadiusMeters || 50;
    }
}

async function handleStartSession(e) {
    e.preventDefault();
    const teacherId = STATE.currentUser.roleEntityId;
    const subjectId = parseInt(document.getElementById('teacher-select-subject').value);
    const classroomId = parseInt(document.getElementById('teacher-select-classroom').value);
    const latitude = parseFloat(document.getElementById('session-lat').value);
    const longitude = parseFloat(document.getElementById('session-lon').value);
    const radiusMeters = parseFloat(document.getElementById('session-radius').value);
    const durationMinutes = parseInt(document.getElementById('session-duration').value) || 10;

    if (!subjectId || !classroomId) {
        showToast('Please select a valid subject and classroom', 'warning');
        return;
    }

    try {
        const session = await apiCall('/teacher/session/start', 'POST', {
            teacherId, subjectId, classroomId, latitude, longitude, radiusMeters, durationMinutes
        });

        STATE.activeTeacherSessionId = session.sessionId;
        renderActiveSessionUI(session);
        showToast('Attendance Session Started! QR Code is active.', 'success');
        startLivePolling(session.sessionId);
    } catch (err) {
        showToast(err.message || 'Failed to start attendance session', 'error');
    }
}

function renderActiveSessionUI(session) {
    document.getElementById('no-active-session-msg').style.display = 'none';
    document.getElementById('active-session-body').style.display = 'block';

    const badge = document.getElementById('session-status-badge');
    badge.className = 'badge badge-success';
    badge.textContent = 'LIVE ACTIVE';

    document.getElementById('active-qr-img').src = session.qrCodeBase64;
    document.getElementById('active-session-token-display').textContent = session.sessionToken;
    document.getElementById('active-subject-name').textContent = session.subjectName;
    document.getElementById('active-room-name').textContent = session.roomName;

    startCountdownTimer(session.durationMinutes || 10, session.endTime);
}

function startCountdownTimer(durationMins, endTimeStr) {
    if (sessionCountdownInterval) clearInterval(sessionCountdownInterval);
    const timerEl = document.getElementById('session-countdown-timer');

    let endTime = endTimeStr ? new Date(endTimeStr.replace(' ', 'T')).getTime() : (Date.now() + durationMins * 60 * 1000);

    sessionCountdownInterval = setInterval(() => {
        const now = Date.now();
        const diff = Math.max(0, Math.floor((endTime - now) / 1000));
        
        const m = Math.floor(diff / 60);
        const s = diff % 60;
        if (timerEl) {
            timerEl.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }

        if (diff <= 0) {
            clearInterval(sessionCountdownInterval);
            if (timerEl) timerEl.textContent = 'EXPIRED';
            showToast('Session timer expired!', 'warning');
        }
    }, 1000);
}

async function handleEndSession() {
    if (!STATE.activeTeacherSessionId) return;

    try {
        await apiCall(`/teacher/session/${STATE.activeTeacherSessionId}/end`, 'POST');
        showToast('Attendance Session Ended successfully.', 'info');
        stopLivePolling();
        if (sessionCountdownInterval) clearInterval(sessionCountdownInterval);

        STATE.activeTeacherSessionId = null;
        document.getElementById('no-active-session-msg').style.display = 'block';
        document.getElementById('active-session-body').style.display = 'none';

        const badge = document.getElementById('session-status-badge');
        badge.className = 'badge badge-warning';
        badge.textContent = 'INACTIVE';
    } catch (err) {
        showToast(err.message || 'Failed to end session', 'error');
    }
}

async function checkActiveTeacherSession() {
    if (!STATE.currentUser || !STATE.currentUser.roleEntityId) return;
    try {
        const sessions = await apiCall(`/teacher/sessions/${STATE.currentUser.roleEntityId}`);
        const active = sessions.find(s => s.active);
        if (active) {
            STATE.activeTeacherSessionId = active.id;
            renderActiveSessionUI({
                sessionId: active.id,
                sessionToken: active.sessionToken,
                subjectName: active.subject ? active.subject.subjectName : 'Course',
                roomName: active.classroom ? active.classroom.roomName : 'Classroom',
                durationMinutes: active.durationMinutes || 10,
                endTime: active.endTime,
                qrCodeBase64: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(active.sessionToken)}`
            });
            startLivePolling(active.id);
        }
    } catch (e) {
        console.warn(e);
    }
}

function startLivePolling(sessionId) {
    stopLivePolling();
    fetchLiveScans(sessionId);
    STATE.pollingInterval = setInterval(() => {
        fetchLiveScans(sessionId);
    }, 3000);
}

function stopLivePolling() {
    if (STATE.pollingInterval) {
        clearInterval(STATE.pollingInterval);
        STATE.pollingInterval = null;
    }
}

async function fetchLiveScans(sessionId) {
    try {
        const records = await apiCall(`/teacher/session/${sessionId}/live`);
        const tbody = document.getElementById('table-teacher-live-attendance');
        tbody.innerHTML = '';
        
        const presentCount = records.filter(r => r.status === 'PRESENT').length;
        const countEl = document.getElementById('teacher-live-count');
        if (countEl) countEl.textContent = presentCount;

        if (records.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">No student scans recorded yet for this session.</td></tr>`;
            return;
        }
        records.forEach(r => {
            const studentName = r.student ? r.student.user.fullName : 'Student';
            const rollNo = r.student ? r.student.rollNumber : 'N/A';
            const dept = r.student ? r.student.department : 'N/A';
            const statusBadge = r.status === 'PRESENT'
                ? `<span class="badge badge-success"><i class="fa-solid fa-check"></i> PRESENT</span>`
                : `<span class="badge badge-danger"><i class="fa-solid fa-xmark"></i> REJECTED</span>`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${studentName}</strong></td>
                <td><code>${rollNo}</code></td>
                <td>${dept}</td>
                <td>${r.timestamp ? r.timestamp.substring(11, 19) : ''}</td>
                <td><code>${r.calculatedDistanceMeters}m</code></td>
                <td>${statusBadge}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.warn(e);
    }
}
