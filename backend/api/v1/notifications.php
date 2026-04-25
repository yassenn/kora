<?php
include_once '../../core/initialize.php';

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

$notification = new Notification();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $user_id = $_GET['user_id'] ?? null;
        if (!$user_id) ApiResponse::error('user_id is required');
        $result = $notification->getNotifications($user_id);
        ApiResponse::success('Notifications retrieved', $result);
        break;

    case 'PATCH':
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['id'])) ApiResponse::error('Notification ID is required');
        if ($notification->markAsRead($data['id'])) {
            ApiResponse::success('Notification marked as read');
        } else {
            ApiResponse::error('Update failed');
        }
        break;

    default:
        ApiResponse::error('Method not allowed', 405);
}
?>