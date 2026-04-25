<?php
include_once '../../core/initialize.php';

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

$invitation = new Invitation();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $user_id = $_GET['user_id'] ?? null;
        if (!$user_id) ApiResponse::error('user_id is required');
        $result = $invitation->getUserInvitations($user_id);
        ApiResponse::success('Invitations retrieved', $result);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['match_id']) || empty($data['inviter_id']) || empty($data['invitee_id'])) {
            ApiResponse::error('match_id, inviter_id, and invitee_id are required');
        }
        if ($invitation->createInvitation($data)) {
            ApiResponse::success('Invitation sent successfully');
        } else {
            ApiResponse::error('Creation failed');
        }
        break;

    case 'PATCH':
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['id']) || empty($data['status'])) {
            ApiResponse::error('ID and status are required');
        }
        if ($invitation->updateStatus($data['id'], $data['status'])) {
            ApiResponse::success('Invitation status updated');
        } else {
            ApiResponse::error('Update failed');
        }
        break;

    default:
        ApiResponse::error('Method not allowed', 405);
}
?>