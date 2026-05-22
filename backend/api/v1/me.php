<?php
require_once '../../core/initialize.php';

$decoded = requireBearerToken();

$userModel = new User();
$userData = $userModel->findById($decoded->user_id);

if (!$userData) {
    ApiResponse::error('User not found', 404);
}

// Sanitize
unset($userData->password);

ApiResponse::success('User profile retrieved', [
    'user' => $userData
]);
?>