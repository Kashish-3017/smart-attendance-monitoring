/* Student View Script */

let html5QrCode = null;
let cameraDevicesList = [];
let currentCameraIndex = 0;
let currentFacingMode = "environment"; // Default to rear/back camera
let isScannerActive = false;

async function toggleCameraScanner() {
    const readerDiv = document.getElementById('qr-reader');
    const badgeContainer = document.getElementById('camera-badge-container');
    const switchBtn = document.getElementById('btn-switch-camera');
    if (!readerDiv) return;

    if (!isScannerActive) {
        readerDiv.style.display = 'block';
        if (badgeContainer) badgeContainer.style.display = 'block';

        if (typeof Html5Qrcode === 'undefined') {
            showToast('Camera QR Scanner library is loading. Please try again in a moment.', 'info');
            return;
        }

        if (!html5QrCode) {
            html5QrCode = new Html5Qrcode("qr-reader");
        }

        await startCameraScannerAuto();
    } else {
        await stopCameraScanner();
    }
}

async function startCameraScannerAuto() {
    const switchBtn = document.getElementById('btn-switch-camera');

    try {
        cameraDevicesList = await Html5Qrcode.getCameras();
    } catch (e) {
        console.warn('Camera device enumeration unavailable, using constraints:', e);
        cameraDevicesList = [];
    }

    let cameraSource = null;
    let isRear = true;

    if (cameraDevicesList && cameraDevicesList.length > 0) {
        // Look for rear/back camera in labels
        let rearIdx = cameraDevicesList.findIndex(d => {
            const label = (d.label || '').toLowerCase();
            return label.includes('back') || label.includes('rear') || label.includes('environment') || label.includes('facing back');
        });

        if (rearIdx !== -1) {
            currentCameraIndex = rearIdx;
            isRear = true;
        } else if (cameraDevicesList.length > 1) {
            // On mobile devices where labels may be blank before permission, rear camera is typically the last device
            currentCameraIndex = cameraDevicesList.length - 1;
            isRear = true;
        } else {
            currentCameraIndex = 0;
            isRear = false;
        }

        cameraSource = cameraDevicesList[currentCameraIndex].id;
    } else {
        cameraSource = { facingMode: { ideal: "environment" } };
        isRear = true;
    }

    await launchScannerWithSource(cameraSource, isRear);
    if (switchBtn) switchBtn.style.display = 'inline-flex';
}

async function launchScannerWithSource(source, isRear) {
    if (!html5QrCode) return;
    const readerDiv = document.getElementById('qr-reader');
    const switchBtn = document.getElementById('btn-switch-camera');

    if (isScannerActive) {
        try {
            await html5QrCode.stop();
        } catch (e) {
            console.warn('Scanner stop error:', e);
        }
        isScannerActive = false;
    }

    const config = {
        fps: 15,
        qrbox: { width: 220, height: 220 }
    };

    const handleSuccess = (decodedText) => {
        document.getElementById('student-qr-token').value = decodedText;
        showToast(`Scanned QR Code Token: ${decodedText}`, 'success');
        stopCameraScanner();
    };

    try {
        await html5QrCode.start(source, config, handleSuccess, (err) => {});
        isScannerActive = true;
        updateCameraBadge(isRear);
    } catch (primaryErr) {
        console.warn('Primary camera start failed, attempting fallback:', primaryErr);
        try {
            // Fallback to front camera or constraint
            const fallbackSource = (cameraDevicesList && cameraDevicesList.length > 0)
                ? cameraDevicesList[0].id
                : { facingMode: "user" };
            await html5QrCode.start(fallbackSource, config, handleSuccess, (err) => {});
            isScannerActive = true;
            updateCameraBadge(false);
            showToast('Rear camera unavailable; using available camera.', 'info');
        } catch (fallbackErr) {
            console.error('All camera attempts failed:', fallbackErr);
            showToast('Unable to open camera: ' + (fallbackErr.message || fallbackErr), 'error');
            if (readerDiv) readerDiv.style.display = 'none';
            if (switchBtn) switchBtn.style.display = 'none';
            const badgeContainer = document.getElementById('camera-badge-container');
            if (badgeContainer) badgeContainer.style.display = 'none';
        }
    }
}

function updateCameraBadge(isRear) {
    const badge = document.getElementById('camera-active-status');
    const container = document.getElementById('camera-badge-container');
    if (!badge) return;
    if (container) container.style.display = 'block';

    if (isRear) {
        badge.className = 'badge badge-success';
        badge.innerHTML = `<i class="fa-solid fa-camera"></i> Rear / Back Camera Active`;
    } else {
        badge.className = 'badge badge-warning';
        badge.innerHTML = `<i class="fa-solid fa-camera-rotate"></i> Front Camera Active`;
    }
}

async function stopCameraScanner() {
    const readerDiv = document.getElementById('qr-reader');
    const switchBtn = document.getElementById('btn-switch-camera');
    const badgeContainer = document.getElementById('camera-badge-container');

    if (html5QrCode && isScannerActive) {
        try {
            await html5QrCode.stop();
        } catch (e) {
            console.warn('Error stopping scanner:', e);
        }
        isScannerActive = false;
    }
    if (readerDiv) readerDiv.style.display = 'none';
    if (switchBtn) switchBtn.style.display = 'none';
    if (badgeContainer) badgeContainer.style.display = 'none';
}

async function switchCameraScanner() {
    if (!html5QrCode || !isScannerActive) {
        showToast('Camera is not running. Click Camera to start.', 'warning');
        return;
    }

    if (cameraDevicesList && cameraDevicesList.length > 1) {
        currentCameraIndex = (currentCameraIndex + 1) % cameraDevicesList.length;
        const nextDevice = cameraDevicesList[currentCameraIndex];
        const label = (nextDevice.label || '').toLowerCase();
        const isRear = label.includes('back') || label.includes('rear') || label.includes('environment') || (currentCameraIndex !== 0);

        await launchScannerWithSource(nextDevice.id, isRear);
        showToast(`Switched to: ${nextDevice.label || (isRear ? 'Rear Camera' : 'Front Camera')}`, 'info');
    } else {
        currentFacingMode = (currentFacingMode === "environment") ? "user" : "environment";
        const isRear = (currentFacingMode === "environment");
        await launchScannerWithSource({ facingMode: currentFacingMode }, isRear);
        showToast(`Switched to ${isRear ? 'Rear / Back' : 'Front'} Camera`, 'info');
    }
}

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


