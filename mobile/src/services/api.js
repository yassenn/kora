const API_URL = 'http://10.70.155.141/api/v1';

let AUTH_TOKEN = null;

export const setAuthToken = (token) => { AUTH_TOKEN = token; };

const buildHeaders = (isJson = false) => {
    const headers = {};
    if (isJson) headers['Content-Type'] = 'application/json';
    if (AUTH_TOKEN) headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
    return headers;
};
// Helper to fetch and parse JSON with better errors when server returns HTML or non-JSON
const fetchJson = async (url, options) => {
    const response = await fetch(url, options);
    const text = await response.text();
    if (!response.ok) {
        const snippet = text ? text.trim().slice(0, 300) : 'No response body';
        throw new Error(`HTTP ${response.status}: ${snippet}`);
    }
    try {
        return JSON.parse(text);
    } catch (err) {
        const snippet = text ? text.trim().slice(0, 500) : 'Empty response';
        // The server returned non-JSON (often HTML error page) — include snippet for debugging
        throw new Error(`Invalid JSON response from ${url}: ${snippet}`);
    }
};
export const login = async (email, password) => {
    return fetchJson(`${API_URL}/users.php`, {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify({ type: 'login', email, password }),
    });
};

export const register = async (userData) => {
    return fetchJson(`${API_URL}/users.php`, {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify({ type: 'register', ...userData }),
    });
};

export const getPublicMatches = async () => {
    return fetchJson(`${API_URL}/matches.php`, { headers: buildHeaders() });
};

export const getMatchDetails = async (matchId) => {
    return fetchJson(`${API_URL}/matches.php?id=${matchId}`, { headers: buildHeaders() });
};

export const createMatch = async (matchData) => {
    return fetchJson(`${API_URL}/matches.php`, {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify(matchData),
    });
};

export const joinMatch = async (matchId, playerId) => {
    return fetchJson(`${API_URL}/matches.php`, {
        method: 'PATCH',
        headers: buildHeaders(true),
        body: JSON.stringify({ match_id: matchId, player_id: playerId }),
    });
};
export const updatePlayerStats = async (statsData) => {
    return fetchJson(`${API_URL}/matches.php`, {
        method: 'PUT',
        headers: buildHeaders(true),
        body: JSON.stringify(statsData),
    });
};

export const getUserStats = async (userId) => {
    return fetchJson(`${API_URL}/users.php?stats_for_user_id=${userId}`, { headers: buildHeaders() });
};

export const createPitch = async (pitchData) => {
    return fetchJson(`${API_URL}/pitches.php`, {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify(pitchData),
    });
};

export const getPitches = async () => {
    return fetchJson(`${API_URL}/pitches.php`, { headers: buildHeaders() });
};
