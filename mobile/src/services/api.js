const API_URL = 'http://192.168.1.145:8000/api/v1';

export const login = async (email, password) => {
    const response = await fetch(`${API_URL}/users.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'login', email, password }),
    });
    return response.json();
};

export const register = async (userData) => {
    const response = await fetch(`${API_URL}/users.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'register', ...userData }),
    });
    return response.json();
};

export const getPublicMatches = async () => {
    const response = await fetch(`${API_URL}/matches.php`);
    return response.json();
};

export const getMatchDetails = async (matchId) => {
    const response = await fetch(`${API_URL}/matches.php?id=${matchId}`);
    return response.json();
};

export const createMatch = async (matchData) => {
    const response = await fetch(`${API_URL}/matches.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(matchData),
    });
    return response.json();
};

export const joinMatch = async (matchId, playerId) => {
    const response = await fetch(`${API_URL}/matches.php`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ match_id: matchId, player_id: playerId }),
    });
    return response.json();
};

export const updatePlayerStats = async (statsData) => {
    const response = await fetch(`${API_URL}/matches.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statsData),
    });
    return response.json();
};

export const getUserStats = async (userId) => {
    const response = await fetch(`${API_URL}/users.php?stats_for_user_id=${userId}`);
    return response.json();
};
