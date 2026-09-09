/* Student View Script */

let html5QrCodeScanner = null;

async function loadStudentData() {
    if (!STATE.currentUser || !STATE.currentUser.roleEntityId) return;

    try {
        const studentId = STATE.currentUser.roleEntityId;
        const dashData = await apiCall(`/student/dashboard/${studentId}`);

        // Update Stat Cards
        document.getElementById('student-stat-pct').textContent = dashData.attendancePercentage + '%';
        document.getElementById('student-stat-classes').textContent = `${dashData.attendedClasses} / ${dashData.totalClasses}`;

        const warnBadge = document.getElementById('student-warning-badge');
        if (dashData.attendancePercentage < 75.0) {
            warnBadge.className = 'badge badge-danger';
            warnBadge.textContent = 'LOW ATTENDANCE WARNING (< 75%)';
        } else {
            warnBadge.className = 'badge badge-success';
            warnBadge.textContent = 'Good Standing (>= 75%)';
        }

        renderSubjectWiseBreakdown(dashData.subjectWise || []);
        renderStudentHistory(dashData.recentRecords || []);
        renderStudentNotices(dashData.notices || []);

        updateGeoLocationDisplay();
        loadStudentTimetable();
        loadStudentTodos();
    } catch (err) {
        showToast('Failed to load student dashboard data', 'error');
    }
}

function renderSubjectWiseBreakdown(subjectWise) {
    const container = document.getElementById('subject-wise-container');
    if (!container) return;
    container.innerHTML = '';
    if (subjectWise.length === 0) {
        container.innerHTML = `<div style="color: var(--text-secondary); font-size: 0.85rem;">No subject records found.</div>`;
        return;
    }

    subjectWise.forEach(s => {
        const pct = s.percentage || 0;
        const isWarn = pct < 75.0;
        const card = document.createElement('div');
        card.className = 'subject-card';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                <div>
                    <strong style="color: white;">${s.subjectName}</strong>
                    <span style="font-size: 0.75rem; color: var(--text-secondary); margin-left: 0.4rem;">(${s.subjectCode})</span>
                </div>
                <div style="font-weight: 800; font-size: 1.1rem; color: ${isWarn ? 'var(--accent-warning)' : 'var(--accent-success)'};">${pct}%</div>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); display: flex; justify-content: space-between;">
                <span>Attended: ${s.present} / ${s.total} sessions</span>
                <span>${isWarn ? '<span class="badge badge-warning" style="font-size: 0.65rem;">Warning (<75%)</span>' : '<span class="badge badge-success" style="font-size: 0.65rem;">On Track</span>'}</span>
            </div>
            <div class="progress-bar-bg">
                <div class="progress-bar-fill ${isWarn ? 'warning' : ''}" style="width: ${Math.min(100, Math.max(0, pct))}%;"></div>
            </div>
        `;
        container.appendChild(card);
    });
}

function switchStudentTab(tabName, btnEl) {
    document.querySelectorAll('#view-student .tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('#view-student .tab-content').forEach(c => c.classList.remove('active'));

    btnEl.classList.add('active');
    document.getElementById(`student-tab-${tabName}`).classList.add('active');
}

function renderStudentHistory(records) {
    const tbody = document.getElementById('table-student-history');
    tbody.innerHTML = '';
    if (records.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No attendance verification logs recorded yet.</td></tr>`;
        return;
    }
    records.forEach(r => {
        const subjectName = r.session && r.session.subject ? r.session.subject.subjectName : 'Subject';
        const roomName = r.session && r.session.classroom ? r.session.classroom.roomName : 'Classroom';
        const dateStr = r.timestamp ? r.timestamp.replace('T', ' ').substring(0, 19) : '';
        const badge = r.status === 'PRESENT'
            ? `<span class="badge badge-success"><i class="fa-solid fa-check"></i> PRESENT</span>`
            : `<span class="badge badge-danger"><i class="fa-solid fa-xmark"></i> REJECTED</span>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${subjectName}</strong></td>
            <td>${roomName}</td>
            <td>${dateStr}</td>
            <td><code>${r.calculatedDistanceMeters}m</code></td>
            <td>${badge}</td>
            <td style="font-size: 0.8rem; color: var(--text-secondary);">${r.statusMessage || ''}</td>
        `;
        tbody.appendChild(tr);
    });
}

async function handleStudentSubmitAttendance(e) {
    e.preventDefault();
    if (!STATE.currentUser || !STATE.currentUser.roleEntityId) {
        showToast('Student identity missing', 'error');
        return;
    }

    const sessionToken = document.getElementById('student-qr-token').value.trim();
    if (!sessionToken) {
        showToast('Please enter or scan a valid QR session token', 'warning');
        return;
    }

    const coords = getStudentCurrentCoordinates();
    const btn = document.getElementById('btn-submit-attendance');
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Verifying Geofence & QR...`;

    try {
        const payload = {
            sessionToken: sessionToken,
            studentId: STATE.currentUser.roleEntityId,
            latitude: coords.latitude,
            longitude: coords.longitude
        };

        const result = await apiCall('/student/attendance/mark', 'POST', payload);
        if (result.success) {
            showToast(`Attendance VERIFIED! ${result.message}`, 'success');
            document.getElementById('student-qr-token').value = '';
            loadStudentData(); // Refresh history & stats
        } else {
            showToast(result.message || 'Attendance verification rejected', 'error');
        }
    } catch (err) {
        showToast(err.message || 'Verification failed', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-check-circle"></i> Verify Location & Mark Attendance`;
    }
}

async function loadStudentTimetable() {
    try {
        const list = await apiCall('/student/timetable');
        const tbody = document.getElementById('table-student-timetable');
        tbody.innerHTML = '';
        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center;">No timetable schedule available.</td></tr>`;
            return;
        }
        list.forEach(t => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="badge badge-warning">${t.dayOfWeek}</span></td>
                <td><strong>${t.subject ? t.subject.subjectName : ''}</strong> (${t.subject ? t.subject.subjectCode : ''})</td>
                <td>${t.classroom ? t.classroom.roomName : ''}</td>
                <td><code>${t.startTime} - ${t.endTime}</code></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
    }
}

function renderStudentNotices(notices) {
    const container = document.getElementById('student-notices-container');
    container.innerHTML = '';
    if (notices.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: var(--text-secondary);">No announcements posted.</div>`;
        return;
    }
    notices.forEach(n => {
        const card = document.createElement('div');
        card.style.background = 'rgba(255, 255, 255, 0.03)';
        card.style.border = '1px solid var(--border-color)';
        card.style.borderRadius = 'var(--radius-sm)';
        card.style.padding = '1rem';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                <h4 style="color: var(--accent-secondary); font-size: 1rem;">${n.title}</h4>
                <span style="font-size: 0.75rem; color: var(--text-secondary);">${n.createdAt ? n.createdAt.substring(0, 10) : ''}</span>
            </div>
            <p style="font-size: 0.9rem; color: var(--text-primary); line-height: 1.4;">${n.content}</p>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.5rem; text-align: right;">
                Posted by: <strong>${n.postedBy}</strong>
            </div>
        `;
        container.appendChild(card);
    });
}

async function loadStudentTodos() {
    if (!STATE.currentUser) return;
    try {
        const todos = await apiCall(`/student/todos/${STATE.currentUser.userId}`);
        const container = document.getElementById('student-todos-container');
        container.innerHTML = '';
        if (todos.length === 0) {
            container.innerHTML = `<div style="font-size: 0.85rem; color: var(--text-secondary);">No reminders added yet.</div>`;
            return;
        }
        todos.forEach(t => {
            const item = document.createElement('div');
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.justifyContent = 'space-between';
            item.style.padding = '0.6rem 0.8rem';
            item.style.background = 'var(--bg-surface)';
            item.style.borderRadius = 'var(--radius-sm)';
            item.style.border = '1px solid var(--border-color)';
            
            const checkedAttr = t.completed ? 'checked' : '';
            const textStyle = t.completed ? 'text-decoration: line-through; opacity: 0.6;' : '';

            item.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <input type="checkbox" ${checkedAttr} onchange="handleToggleTodo(${t.id})" style="cursor: pointer;">
                    <span style="${textStyle}">${t.title}</span>
                </div>
            `;
            container.appendChild(item);
        });
    } catch (err) {
        console.error(err);
    }
}

async function handleAddTodo(e) {
    e.preventDefault();
    const input = document.getElementById('input-todo-title');
    const title = input.value.trim();
    if (!title || !STATE.currentUser) return;

    try {
        await apiCall(`/student/todos/${STATE.currentUser.userId}`, 'POST', { title });
        input.value = '';
        loadStudentTodos();
        showToast('Reminder added', 'success');
    } catch (err) {
        showToast('Failed to add reminder', 'error');
    }
}

async function handleToggleTodo(todoId) {
    try {
        await apiCall(`/student/todos/${todoId}/toggle`, 'PUT');
        loadStudentTodos();
    } catch (err) {
        console.error(err);
    }
}

function toggleCameraScanner() {
    const readerDiv = document.getElementById('qr-reader');
    if (!readerDiv) return;

    if (readerDiv.style.display === 'none' || !readerDiv.style.display) {
        readerDiv.style.display = 'block';
        if (typeof Html5QrcodeScanner !== 'undefined') {
            html5QrCodeScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 200 });
            html5QrCodeScanner.render((decodedText) => {
                document.getElementById('student-qr-token').value = decodedText;
                showToast(`Scanned QR Code Token: ${decodedText}`, 'success');
                html5QrCodeScanner.clear();
                readerDiv.style.display = 'none';
            }, (error) => {
                // Ignore scan frame errors
            });
        } else {
            showToast('Camera QR Scanner library loading...', 'info');
        }
    } else {
        if (html5QrCodeScanner) {
            html5QrCodeScanner.clear();
        }
        readerDiv.style.display = 'none';
    }
}
