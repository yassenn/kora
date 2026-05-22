<?php
require_once '../../core/initialize.php';

// Rate Limiting: Max 60 requests per minute
$ip = $_SERVER['REMOTE_ADDR'];
if (!RateLimiter::check($_SERVER['SCRIPT_NAME'] . "_$ip", 60, 60)) {
    ApiResponse::error('Too many requests. Please try again later.', 429);
}

$warning = new Warning();
$method = $_SERVER['REQUEST_METHOD'];

try {
    $decoded = requireBearerToken();

    switch ($method) {
        case 'GET':
            $player_id = $_GET['player_id'] ?? null;
            if (!$player_id) ApiResponse::error('player_id is required');
            
            // Security check: users can only see their own warnings unless admin
            if ($player_id != $decoded->user_id && $decoded->user_type !== 'admin') {
                ApiResponse::error('Unauthorized access to warnings', 403);
            }

            $result = $warning->getPlayerWarnings($player_id);
            ApiResponse::success('Warnings retrieved', $result);
            break;

        case 'POST':
            if ($decoded->user_type !== 'admin') {
                ApiResponse::error('Unauthorized: Admin access required', 403);
            }

            $data = json_decode(file_get_contents("php://input"), true);
            if (empty($data['player_id']) || empty($data['reason'])) {
                ApiResponse::error('player_id and reason are required');
            }
            
            // Force admin_id to be the authenticated user
            $data['admin_id'] = $decoded->user_id;

            if ($warning->addWarning($data)) {
                ApiResponse::success('Warning added successfully');
            } else {
                ApiResponse::error('Creation failed');
            }
            break;

        default:
            ApiResponse::error('Method not allowed', 405);
    }
} catch (Exception $e) {
    ApiResponse::error('An unexpected error occurred: ' . $e->getMessage(), 500);
}
?>