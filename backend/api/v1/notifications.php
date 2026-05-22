<?php
require_once '../../core/initialize.php';

// Rate Limiting: Max 60 requests per minute
$ip = $_SERVER['REMOTE_ADDR'];
if (!RateLimiter::check($_SERVER['SCRIPT_NAME'] . "_$ip", 60, 60)) {
    ApiResponse::error('Too many requests. Please try again later.', 429);
}

$notification = new Notification();
$method = $_SERVER['REQUEST_METHOD'];

try {
    $decoded = requireBearerToken();

    switch ($method) {
        case 'GET':
            $user_id = $_GET['user_id'] ?? $decoded->user_id;
            
            // Security check: users can only see their own notifications unless admin
            if ($user_id != $decoded->user_id && $decoded->user_type !== 'admin') {
                ApiResponse::error('Unauthorized access to notifications', 403);
            }

            $result = $notification->getNotifications($user_id);
            ApiResponse::success('Notifications retrieved', $result);
            break;

        case 'PATCH':
            $data = getJsonInput();
            if (empty($data['id'])) ApiResponse::error('Notification ID is required');
            
            // Authorization check
            $existing_notification = $notification->getNotificationById($data['id']);
            if (!$existing_notification) {
                ApiResponse::error('Notification not found', 404);
            }

            if ($existing_notification->user_id != $decoded->user_id && $decoded->user_type !== 'admin') {
                ApiResponse::error('Unauthorized to update this notification', 403);
            }

            if ($notification->markAsRead($data['id'])) {
                ApiResponse::success('Notification marked as read');
            } else {
                ApiResponse::error('Update failed');
            }
            break;

        default:
            ApiResponse::error('Method not allowed', 405);
    }
} catch (Exception $e) {
    ApiResponse::error('An unexpected error occurred: ' . $e->getMessage(), 500);
}
?>