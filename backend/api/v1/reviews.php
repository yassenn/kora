<?php
include_once '../../core/initialize.php';

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit();

$review = new Review();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $pitch_id = $_GET['pitch_id'] ?? null;
        if (!$pitch_id) ApiResponse::error('pitch_id is required');
        $result = $review->getPitchReviews($pitch_id);
        ApiResponse::success('Reviews retrieved', $result);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['pitch_id']) || empty($data['player_id']) || empty($data['rating'])) {
            ApiResponse::error('pitch_id, player_id, and rating are required');
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
?>