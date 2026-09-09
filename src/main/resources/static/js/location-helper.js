/* Geolocation Helper & Viva Demo Simulator */

const GEO_STATE = {
    mode: 'BROWSER', // 'BROWSER', 'PRESET_INSIDE', 'PRESET_OUTSIDE'
    latitude: 19.0760,
    longitude: 72.8777
};

function handleGeoModeChange() {
    const select = document.getElementById('student-geo-mode');
    if (!select) return;

    GEO_STATE.mode = select.value;
    updateGeoLocationDisplay();
}

function updateGeoLocationDisplay() {
    const displayEl = document.getElementById('geo-coords-display');
    const statusEl = document.getElementById('geo-status-indicator');
    const radarPill = document.getElementById('radar-status-pill');
    const radarDist = document.getElementById('radar-distance-val');

    if (GEO_STATE.mode === 'PRESET_INSIDE') {
        GEO_STATE.latitude = 19.0760;
        GEO_STATE.longitude = 72.8777;
        if (displayEl) displayEl.textContent = `Preset Coords: 19.0760, 72.8777 (Inside Lab 3 Geofence)`;
        if (statusEl) statusEl.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--accent-success);"></i> Viva Preset: Lab 3 Inside`;
        if (radarPill) {
            radarPill.className = 'status-pill inside';
            radarPill.innerHTML = `<i class="fa-solid fa-circle-check"></i> INSIDE PERMITTED GEOFENCE`;
        }
        if (radarDist) radarDist.textContent = '0.0m';
    } else if (GEO_STATE.mode === 'PRESET_OUTSIDE') {
        GEO_STATE.latitude = 19.0850;
        GEO_STATE.longitude = 72.8850;
        if (displayEl) displayEl.textContent = `Preset Coords: 19.0850, 72.8850 (Outside Campus / Food Court ~1.2km away)`;
        if (statusEl) statusEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: var(--accent-danger);"></i> Viva Preset: Outside Campus`;
        if (radarPill) {
            radarPill.className = 'status-pill outside';
            radarPill.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> OUTSIDE PERMITTED GEOFENCE`;
        }
        if (radarDist) radarDist.textContent = '1260.9m';
    } else {
        // Request actual browser geolocation
        if ("geolocation" in navigator) {
            if (displayEl) displayEl.textContent = "Acquiring live browser GPS signal...";
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    GEO_STATE.latitude = pos.coords.latitude;
                    GEO_STATE.longitude = pos.coords.longitude;
                    if (displayEl) displayEl.textContent = `Live GPS: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)} (Accuracy: ±${Math.round(pos.coords.accuracy)}m)`;
                    if (statusEl) statusEl.innerHTML = `<i class="fa-solid fa-circle" style="color: var(--accent-success);"></i> Live Browser GPS`;
                    
                    // Simple Haversine calculation relative to Lab 3 center (19.0760, 72.8777)
                    const dist = calculateDistanceMeters(pos.coords.latitude, pos.coords.longitude, 19.0760, 72.8777);
                    if (radarDist) radarDist.textContent = `${dist.toFixed(1)}m`;
                    if (radarPill) {
                        if (dist <= 50) {
                            radarPill.className = 'status-pill inside';
                            radarPill.innerHTML = `<i class="fa-solid fa-circle-check"></i> INSIDE PERMITTED GEOFENCE`;
                        } else {
                            radarPill.className = 'status-pill outside';
                            radarPill.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> OUTSIDE PERMITTED GEOFENCE`;
                        }
                    }
                },
                (err) => {
                    console.warn("Geolocation permission error or unavailable:", err.message);
                    GEO_STATE.latitude = 19.0760; // Fallback to Lab 3 center for dev
                    GEO_STATE.longitude = 72.8777;
                    if (displayEl) displayEl.textContent = `GPS Access Blocked/Unavailable. Defaulting to: 19.0760, 72.8777`;
                    if (statusEl) statusEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: var(--accent-warning);"></i> GPS Blocked (Using Default)`;
                    if (radarPill) {
                        radarPill.className = 'status-pill inside';
                        radarPill.innerHTML = `<i class="fa-solid fa-circle-check"></i> DEFAULT LAB 3 COORDS`;
                    }
                    if (radarDist) radarDist.textContent = '0.0m';
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            if (displayEl) displayEl.textContent = `Browser GPS not supported. Defaulting to 19.0760, 72.8777`;
        }
    }
}

function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function getStudentCurrentCoordinates() {
    return {
        latitude: GEO_STATE.latitude,
        longitude: GEO_STATE.longitude
    };
}
