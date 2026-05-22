<?php
require_once '../../core/initialize.php';

$user = new User();
$method = $_SERVER['REQUEST_METHOD'];
$ip = $_SERVER['REMOTE_ADDR'];

try {
    if ($method !== 'POST') {
        ApiResponse::error('Method not allowed', 405);
    }

    $data = json_decode(file_get_contents("php://input"), true);

    if (empty($data['user_id']) || empty($data['code'])) {
        ApiResponse::validationError('User ID and verification code are required');
    }

    // Rate Limit: 5/min for verification attempts
    if (!RateLimiter::check("verify_{$data['user_id']}_$ip", 5, 60)) {
        ApiResponse::error('Too many attempts. Please try again later.', 429);
    }

    if ($user->verifyOTP($data['user_id'], $data['code'])) {
        $verified_user = $user->findById($data['user_id']);
        
        if ($verified_user) {
            // Issue JWT
            $payload = [
                'user_id' => $verified_user->id,
                'user_type' => $verified_user->user_type,
                'exp' => time() + (int)(getenv('JWT_EXPIRATION') ?: 3600)
            ];
            $token = SimpleJWT::encode($payload);

            // Generate Refresh Token
            $refreshTokenModel = new RefreshToken();
            $refreshToken = $refreshTokenModel->create($verified_user->id);

            // Sanitize user object
            unset($verified_user->password);
            unset($verified_user->verification_code);
            unset($verified_user->verification_expires_at);

            ApiResponse::success('Email verified successfully', [
                'user' => $verified_user,
                'token' => $token,
                'refresh_token' => $refreshToken
            ]);
        } else {
            ApiResponse::error('User not found after verification', 404);
        }
    } else {
        ApiResponse::error('Invalid or expired verification code', 400);
    }

} catch (Exception $e) {
    ApiResponse::error('An unexpected error occurred: ' . $e->getMessage(), 500);
}
