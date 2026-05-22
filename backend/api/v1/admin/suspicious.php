<?php
require_once '../../core/initialize.php';

try {
    $decoded = requireBearerToken();

    // Only admin can access this endpoint
    if ($decoded->user_type !== 'admin') {
        ApiResponse::error('Unauthorized: Admin access required', 403);
    }

    $activityModel = new SuspiciousActivity();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        if (isset($_GET['user_id'])) {
            $user_id = intval($_GET['user_id']);
            $result = $activityModel->getUserActivity($user_id);
            ApiResponse::success('User suspicious activity retrieved', $result);
        } else {
            $result = $activityModel->getSuspiciousUsers();
            ApiResponse::success('Suspicious users list retrieved', $result);
        }
    } else {
        ApiResponse::error('Method not allowed', 405);
    }

} catch (Exception $e) {
    ApiResponse::error('An unexpected error occurred: ' . $e->getMessage(), 500);
}
?>