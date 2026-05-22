<?php
require_once '../../core/initialize.php';

// Rate Limiting: Max 60 requests per minute
$ip = $_SERVER['REMOTE_ADDR'];
if (!RateLimiter::check($_SERVER['SCRIPT_NAME'] . "_$ip", 60, 60)) {
    ApiResponse::error('Too many requests. Please try again later.', 429);
}

$invitation = new Invitation();
$method = $_SERVER['REQUEST_METHOD'];

try {
    // All invitation endpoints require authentication
    $decoded = requireBearerToken();

    switch ($method) {
        case 'GET':
            if (isset($_GET['match_id'])) {
                $match_id = $_GET['match_id'];
                
                // Fetch invitations first to check involvement
                $result = $invitation->getMatchInvitations($match_id);
                
                // Authorization check
                $match_model = new SoccerMatch();
                $existing_match = $match_model->getMatchById($match_id);
                
                $is_authorized = ($decoded->user_type === 'admin');
                if ($existing_match && $existing_match->creator_id == $decoded->user_id) {
                    $is_authorized = true;
                }
                
                if (!$is_authorized) {
                    foreach ($result as $inv) {
                        if ($inv->invitee_id == $decoded->user_id || $inv->inviter_id == $decoded->user_id) {
                            $is_authorized = true;
                            break;
                        }
                    }
                }

                if (!$is_authorized) {
                    ApiResponse::error('Unauthorized to view invitations for this match', 403);
                }

                ApiResponse::success('Match invitations retrieved', $result);
            } else {
                $user_id = $_GET['user_id'] ?? $decoded->user_id;
                
                // Security check: users can only see their own invitations unless admin
                if ($user_id != $decoded->user_id && $decoded->user_type !== 'admin') {
                    ApiResponse::error('Unauthorized access to invitations', 403);
                }

                $result = $invitation->getUserInvitations($user_id);
                ApiResponse::success('Invitations retrieved', $result);
            }
            break;

        case 'POST':
            $data = getJsonInput();
            if (empty($data['match_id']) || empty($data['invitee_id'])) {
                ApiResponse::error('match_id and invitee_id are required');
            }
            
            // Force inviter_id to be the authenticated user
            $data['inviter_id'] = $decoded->user_id;

            if ($invitation->createInvitation($data)) {
                ApiResponse::success('Invitation sent successfully');
            } else {
                ApiResponse::error('Creation failed');
            }
            break;

        case 'PATCH':
            $data = getJsonInput();
            if (empty($data['id']) || empty($data['status'])) {
                ApiResponse::error('ID and status are required');
            }
            
            Validator::validateEnum($data['status'], ['pending', 'accepted', 'declined'], 'status');

            $existing_invitation = $invitation->getInvitationById($data['id']);
            if (!$existing_invitation) {
                ApiResponse::error('Invitation not found', 404);
            }

            // Authorization: Only the invitee can update the status
            if ($existing_invitation->invitee_id != $decoded->user_id && $decoded->user_type !== 'admin') {
                ApiResponse::error('Unauthorized to update this invitation', 403);
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
} catch (Exception $e) {
    ApiResponse::error('An unexpected error occurred: ' . $e->getMessage(), 500);
}
?>