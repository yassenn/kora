import { Platform } from 'react-native';
import { CONFIG } from '../config';

const API_URL = CONFIG.API_URL;

let AUTH_TOKEN = null;
let REFRESH_TOKEN = null;
let onTokenRefresh = null;

export const setAuthTokens = (accessToken, refreshToken) => { 
    AUTH_TOKEN = accessToken; 
    REFRESH_TOKEN = refreshToken;
};

export const setAuthToken = (token) => {
    AUTH_TOKEN = token;
};

export const setOnTokenRefresh = (callback) => {
    onTokenRefresh = callback;
};

const buildHeaders = (isJson = false) => {
    const headers = {};
    if (isJson) headers['Content-Type'] = 'application/json';
    if (AUTH_TOKEN) headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
    
    // Security Metadata (Used for suspicious activity tracking)
    // Note: For more detailed info like Phone Model or IMEI, 
    // you should install 'react-native-device-info'
    headers['X-OS'] = Platform.OS;
    headers['X-ANDROID-VERSION'] = Platform.Version?.toString() || 'N/A';
    
    return headers;
};

// Helper to refresh token
export const refreshToken = async () => {
    if (!REFRESH_TOKEN) throw new Error('No refresh token available');
    
    try {
        const response = await fetch(`${API_URL}/refresh.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: REFRESH_TOKEN }),
        });
        
        const res = await response.json();
        if (res.success) {
            const { token, refresh_token } = res.data;
            setAuthTokens(token, refresh_token);
            if (onTokenRefresh) {
                onTokenRefresh(token, refresh_token);
            }
            return token;
        } else {
            throw new Error(res.message || 'Refresh failed');
        }
    } catch (error) {
        console.error('Failed to refresh token:', error);
        throw error;
    }
};

// Helper to fetch and parse JSON with better errors and automatic retry
const fetchJson = async (url, options, retry = true) => {
    if (__DEV__) {
        console.log(`[API Request] ${options?.method || 'GET'} ${url}`);
    }
    
    // Support HttpOnly cookies on web (VULN-004)
    if (Platform.OS === 'web') {
        options = { ...options, credentials: 'include' };
    }

    try {
        const response = await fetch(url, options);
        
        // Handle 401 Unauthorized
        if (response.status === 401 && retry && REFRESH_TOKEN) {
            if (__DEV__) {
                console.log('Access token expired, attempting refresh...');
            }
            try {
                const newToken = await refreshToken();
                // Retry with new token
                const newOptions = {
                    ...options,
                    headers: {
                        ...options.headers,
                        'Authorization': `Bearer ${newToken}`
                    }
                };
                return fetchJson(url, newOptions, false);
            } catch (refreshErr) {
                if (__DEV__) {
                    console.error('Refresh retry failed', refreshErr);
                }
                throw new Error('AUTH_EXPIRED');
            }
        }

        const text = await response.text();
        
        if (__DEV__) {
            console.log(`[API Response] ${response.status} from ${url}`);
        }

        if (!response.ok) {
            try {
                const errorObj = JSON.parse(text);
                throw new Error(errorObj.message || text || `HTTP ${response.status}`);
            } catch (e) {
                throw new Error(text || `HTTP ${response.status}`);
            }
        }
        try {
            return JSON.parse(text);
        } catch (err) {
            throw new Error('Invalid JSON response');
        }
    } catch (error) {
        if (__DEV__ && error.message !== 'AUTH_EXPIRED') {
            console.warn(`[API Error] for ${url}: ${error.message}`);
        }
        throw error;
    }
};

// User APIs
export const me = async () => {
    return fetchJson(`${API_URL}/me.php`, { headers: buildHeaders() });
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

export const verifyOTP = async (userId, code) => {
    return fetchJson(`${API_URL}/verify.php`, {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify({ user_id: userId, code }),
    });
};

export const getUserStats = async (userId) => {
    return fetchJson(`${API_URL}/users.php?stats_for_user_id=${encodeURIComponent(userId)}`, { headers: buildHeaders() });
};

export const switchUserRole = async (userId, role) => {
    return fetchJson(`${API_URL}/users.php`, {
        method: 'PUT',
        headers: buildHeaders(true),
        body: JSON.stringify({ id: userId, user_type: role }),
    });
};

export const updateFcmToken = async (fcmToken) => {
    return fetchJson(`${API_URL}/users.php`, {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify({ type: 'update_fcm_token', fcm_token: fcmToken }),
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
    return fetchJson(`${API_URL}/matches.php?id=${encodeURIComponent(matchId)}`, { headers: buildHeaders() });
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
    return fetchJson(`${API_URL}/matches.php?upcoming_for_user_id=${encodeURIComponent(userId)}`, { headers: buildHeaders() });
};

export const checkAvailability = async (pitchId, date) => {
    return fetchJson(`${API_URL}/matches.php?check_availability=true&pitch_id=${encodeURIComponent(pitchId)}&date=${encodeURIComponent(date)}`, { headers: buildHeaders() });
};

// Pitch APIs
export const getPitches = async () => {
    return fetchJson(`${API_URL}/pitches.php`, { headers: buildHeaders() });
};

export const getPitchDetails = async (pitchId) => {
    return fetchJson(`${API_URL}/pitches.php?id=${encodeURIComponent(pitchId)}`, { headers: buildHeaders() });
};

export const getRecentPitches = async (limit = 5) => {
    return fetchJson(`${API_URL}/pitches.php?recent=true&limit=${encodeURIComponent(limit)}`, { headers: buildHeaders() });
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
    return fetchJson(`${API_URL}/notifications.php?user_id=${encodeURIComponent(userId)}`, { headers: buildHeaders() });
};

export const markNotificationRead = async (id) => {
    return fetchJson(`${API_URL}/notifications.php`, {
        method: 'PATCH',
        headers: buildHeaders(true),
        body: JSON.stringify({ id }),
    });
};

// User Discovery
export const getUsers = async (search = '') => {
    const url = search ? `${API_URL}/users.php?search=${encodeURIComponent(search)}` : `${API_URL}/users.php`;
    return fetchJson(url, { headers: buildHeaders() });
};

// Admin APIs
export const getSuspiciousUsers = async () => {
    return fetchJson(`${API_URL}/admin/suspicious.php`, { headers: buildHeaders() });
};

export const getUserSuspiciousActivity = async (userId) => {
    return fetchJson(`${API_URL}/admin/suspicious.php?user_id=${encodeURIComponent(userId)}`, { headers: buildHeaders() });
};

// Review APIs
export const getPitchReviews = async (pitchId) => {
    return fetchJson(`${API_URL}/reviews.php?pitch_id=${encodeURIComponent(pitchId)}`, { headers: buildHeaders() });
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
    return fetchJson(`${API_URL}/notifications.php?user_id=${encodeURIComponent(userId)}`, { headers: buildHeaders() });
};

export const getMatchInvitations = async (matchId) => {
    return fetchJson(`${API_URL}/invitations.php?match_id=${encodeURIComponent(matchId)}`, { headers: buildHeaders() });
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

// Friend APIs
export const getPendingFriends = async () => {
    return fetchJson(`${API_URL}/friends.php?pending=true`, { headers: buildHeaders() });
};

export const sendFriendRequest = async (friendId) => {
    return fetchJson(`${API_URL}/friends.php`, {
        method: 'POST',
        headers: buildHeaders(true),
        body: JSON.stringify({ friend_id: friendId }),
    });
};

export const acceptFriendRequest = async (friendId) => {
    return fetchJson(`${API_URL}/friends.php`, {
        method: 'PATCH',
        headers: buildHeaders(true),
        body: JSON.stringify({ friend_id: friendId, action: 'accept' }),
    });
};
