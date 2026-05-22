<?php
require_once '../../core/initialize.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ApiResponse::error('Method not allowed', 405);
}

$data = json_decode(file_get_contents("php://input"), true);
$refreshTokenStr = $data['refresh_token'] ?? null;

if (!$refreshTokenStr) {
    ApiResponse::error('Refresh token is required', 400);
}

$refreshTokenModel = new RefreshToken();
$userModel = new User();

try {
    // 1. Validate the refresh token
    $tokenRow = $refreshTokenModel->validate($refreshTokenStr);
    
    if (!$tokenRow) {
        ApiResponse::error('Invalid or expired refresh token', 401);
    }

    // 2. Get user details
    $userData = $userModel->findById($tokenRow->user_id);
    
    if (!$userData) {
        ApiResponse::error('User not found', 404);
    }

    // 3. Token Rotation: Revoke the old refresh token and issue a new one
    $refreshTokenModel->delete($refreshTokenStr);
    $newRefreshToken = $refreshTokenModel->create($userData->id);
    
    if (!$newRefreshToken) {
        ApiResponse::error('Failed to generate new refresh token', 500);
    }

    // 4. Issue new Access Token (JWT)
    $payload = [
        'user_id' => $userData->id,
        'user_type' => $userData->user_type,
        'exp' => time() + (int)(getenv('JWT_EXPIRATION') ?: 3600)
    ];
    $newAccessToken = SimpleJWT::encode($payload);

    // Set HttpOnly cookie for web clients (VULN-004)
    setcookie('token', $newAccessToken, [
        'expires' => time() + (int)(getenv('JWT_EXPIRATION') ?: 3600),
        'path' => '/',
        'domain' => '', // Set to your domain in production
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);

    ApiResponse::success('Token refreshed successfully', [
        'token' => $newAccessToken,
        'refresh_token' => $newRefreshToken
    ]);

} catch (Exception $e) {
    ApiResponse::error('An unexpected error occurred: ' . $e->getMessage(), 500);
}
?>