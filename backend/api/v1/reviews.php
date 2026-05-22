<?php
require_once '../../core/initialize.php';

// Rate Limiting: Max 60 requests per minute
$ip = $_SERVER['REMOTE_ADDR'];
if (!RateLimiter::check($_SERVER['SCRIPT_NAME'] . "_$ip", 60, 60)) {
    ApiResponse::error('Too many requests. Please try again later.', 429);
}

$review = new Review();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            $pitch_id = $_GET['pitch_id'] ?? null;
            if (!$pitch_id) ApiResponse::error('pitch_id is required');
            $result = $review->getPitchReviews($pitch_id);
            ApiResponse::success('Reviews retrieved', $result);
            break;

        case 'POST':
            $decoded = requireBearerToken();
            $data = getJsonInput();
            
            if (empty($data['pitch_id']) || empty($data['player_id']) || empty($data['rating'])) {
                ApiResponse::error('pitch_id, player_id, and rating are required');
            }
            
            // Ensure player_id matches authenticated user
            if ($data['player_id'] != $decoded->user_id && $decoded->user_type !== 'admin') {
                ApiResponse::error('Unauthorized: You can only post reviews as yourself', 403);
            }

            if ($review->addReview($data)) {
                ApiResponse::success('Review added successfully');
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