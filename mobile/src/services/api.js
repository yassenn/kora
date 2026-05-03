import { CONFIG } from '../config';

const API_URL = CONFIG.API_URL;

let AUTH_TOKEN = null;

export const setAuthToken = (token) => { AUTH_TOKEN = token; };

const buildHeaders = (isJson = false) => {
    const headers = {};
    if (isJson) headers['Content-Type'] = 'application/json';
    if (AUTH_TOKEN) headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
    return headers;
};

// Helper to fetch and parse JSON with better errors
const fetchJson = async (url, options) => {
    console.log(`[API Request] ${options?.method || 'GET'} ${url}`);
    try {
        const response = await fetch(url, options);
        const text = await response.text();
        console.log(`[API Response] ${response.status} from ${url}: ${text.slice(0, 100)}...`);
        if (!response.ok) {
            const snippet = text ? text.trim().slice(0, 300) : 'No response body';
            throw new Error(`HTTP ${response.status}: ${snippet}`);
        }
        try {
            return JSON.parse(text);
        } catch (err) {
            throw new Error(`Invalid JSON response: ${text.slice(0, 500)}`);
        }
    } catch (error) {
        console.error(`[API Error] for ${url}:`, error);
        throw error;
    }
};

// User APIs
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

export const getUserStats = async (userId) => {
    return fetchJson(`${API_URL}/users.php?stats_for_user_id=${userId}`, { headers: buildHeaders() });
};

export const switchUserRole = async (userId, role) => {
    return fetchJson(`${API_URL}/users.php`, {
        method: 'PUT',
        headers: buildHeaders(true),
        body: JSON.stringify({ id: userId, user_type: role }),
    });
};

// Match APIs
export const getPublicMatches = async () => {
    return fetchJson(`${API_URL}/matches.php`, { headers: buildHeaders() });
};

export const getMatches = async () => {
    return fetchJson(`${API_URL}/matches.php?all=true`, { headers: buildHeaders() });
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

export const leaveMatch = async (matchId, playerId) => {
    return fetchJson(`${API_URL}/matches.php`, {
        method: 'DELETE',
        headers: buildHeaders(true),
        body: JSON.stringify({ match_id: matchId, player_id: playerId }),
    });
};

export const updatePlayerStats = async (statsData) => {
    return fetchJson(`${API_URL}/matches.php`, {
        method: 'PUT',
        headers: buildHeaders(true),
        body: JSON.stringify({ type: 'update_stats', ...statsData }),
    });
};

export const getUpcomingMatches = async (userId) => {
    return fetchJson(`${API_URL}/matches.php?upcoming_for_user_id=${userId}`, { headers: buildHeaders() });
};

export const checkAvailability = async (pitchId, date) => {
    return fetchJson(`${API_URL}/matches.php?check_availability=true&pitch_id=${pitchId}&date=${date}`, { headers: buildHeaders() });
};

// Pitch APIs
export const getPitches = async () => {
    return fetchJson(`${API_URL}/pitches.php`, { headers: buildHeaders() });
};

export const getRecentPitches = async (limit = 5) => {
    return fetchJson(`${API_URL}/pitches.php?recent=true&limit=${limit}`, { headers: buildHeaders() });
};

export const createPitch = async (pitchData) => {
    return fetchJson(`${API_URL}/pitches.php`, {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify(pitchData),
    });
};

export const updatePitch = async (pitchId, pitchData) => {
    return fetchJson(`${API_URL}/pitches.php`, {
        method: 'PUT',
        headers: buildHeaders(true),
        body: JSON.stringify({ id: pitchId, ...pitchData }),
    });
};

export const updatePitchStatus = async (pitchId, status) => {
    return fetchJson(`${API_URL}/pitches.php`, {
        method: 'PUT',
        headers: buildHeaders(true),
        body: JSON.stringify({ id: pitchId, status }),
    });
};

// Notification APIs
export const getNotifications = async (userId) => {
    return fetchJson(`${API_URL}/notifications.php?user_id=${userId}`, { headers: buildHeaders() });
};

export const markNotificationRead = async (id) => {
    return fetchJson(`${API_URL}/notifications.php`, {
        method: 'PATCH',
        headers: buildHeaders(true),
        body: JSON.stringify({ id }),
    });
};

// User Discovery
export const getUsers = async () => {
    return fetchJson(`${API_URL}/users.php`, { headers: buildHeaders() });
};

// Review APIs
export const getPitchReviews = async (pitchId) => {
    return fetchJson(`${API_URL}/reviews.php?pitch_id=${pitchId}`, { headers: buildHeaders() });
};

export const submitReview = async (reviewData) => {
    return fetchJson(`${API_URL}/reviews.php`, {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify(reviewData),
    });
};

// Invitation APIs
export const getInvitations = async (userId) => {
    return fetchJson(`${API_URL}/notifications.php?user_id=${userId}`, { headers: buildHeaders() });
};

export const getMatchInvitations = async (matchId) => {
    return fetchJson(`${API_URL}/invitations.php?match_id=${matchId}`, { headers: buildHeaders() });
};

export const sendInvitation = async (invitationData) => {
    return fetchJson(`${API_URL}/invitations.php`, {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify(invitationData),
    });
};

export const respondToInvitation = async (invitationId, status) => {
    return fetchJson(`${API_URL}/invitations.php`, {
        method: 'PATCH',
        headers: buildHeaders(true),
        body: JSON.stringify({ id: invitationId, status }),
    });
};
