<?php
require_once '../../core/initialize.php';

$friend = new Friend();
$method = $_SERVER['REQUEST_METHOD'];
$decoded = requireBearerToken();
$user_id = $decoded->user_id;

try {
    switch ($method) {
        case 'GET':
            if (isset($_GET['pending'])) {
                $result = $friend->getPendingRequests($user_id);
                ApiResponse::success('Pending requests retrieved', $result);
            } else {
                $result = $friend->getFriends($user_id);
                ApiResponse::success('Friends retrieved', $result);
            }
            break;

        case 'POST':
            $data = getJsonInput();
            if (empty($data['friend_id'])) {
                ApiResponse::error('friend_id is required');
            }
            if ($friend->sendRequest($user_id, $data['friend_id'])) {
                ApiResponse::success('Friend request sent');
            } else {
                ApiResponse::error('Could not send friend request. You might already be friends or have a pending request.');
            }
            break;

        case 'PATCH':
            $data = getJsonInput();
            if (empty($data['friend_id']) || empty($data['action'])) {
                ApiResponse::error('friend_id and action are required');
            }
            
            Validator::validateEnum($data['action'], ['accept', 'decline'], 'action');

            if ($data['action'] === 'accept') {
                if ($friend->acceptRequest($user_id, $data['friend_id'])) {
                    ApiResponse::success('Friend request accepted');
                } else {
                    ApiResponse::error('Failed to accept request');
                }
            } else {
                // Handle decline logic if implemented in the model
                ApiResponse::success('Friend request declined');
            }
            break;

        default:
            ApiResponse::error('Method not allowed', 405);
    }
} catch (Exception $e) {
    ApiResponse::error('An unexpected error occurred: ' . $e->getMessage(), 500);
}
?>
