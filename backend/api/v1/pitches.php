<?php
// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

include_once '../../core/initialize.php';

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Instantiate Pitch object
$pitch = new Pitch();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $result = $pitch->getPitchById(intval($_GET['id']));
            if ($result) {
                ApiResponse::success('Pitch retrieved', $result);
            } else {
                ApiResponse::error('Pitch not found', 404);
            }
        } elseif (isset($_GET['recent'])) {
            $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 5;
            $result = $pitch->getRecentPitches($limit);
            ApiResponse::success('Recent pitches retrieved', $result);
        } else {
            $result = $pitch->getPitches();
            ApiResponse::success('Pitches retrieved', $result);
        }
        break;

    case 'POST':
        // Get raw posted data
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data) {
            ApiResponse::error('Invalid JSON input', 400);
        }

        // Validate pitch data
        $errors = $pitch->getValidationErrors($data);
        if (!empty($errors)) {
            ApiResponse::validationError('Pitch creation validation failed', $errors);
        }

        // Create pitch
        if ($pitch->addPitch($data)) {
            ApiResponse::success('Pitch created successfully');
        } else {
            ApiResponse::error('Pitch creation failed', 500);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || empty($data['id'])) {
            ApiResponse::error('Pitch ID is required', 400);
        }

        $success = false;
        if (isset($data['status']) && count($data) <= 2) {
            // Only status is being updated
            $success = $pitch->updatePitchStatus($data['id'], $data['status']);
        } else {
            // Full update
            $success = $pitch->updatePitch($data['id'], $data);
        }

        if ($success) {
            ApiResponse::success('Pitch updated successfully');
        } else {
            ApiResponse::error('Pitch update failed', 500);
        }
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'] ?? $_GET['id'] ?? null;

        if (!$id) {
            ApiResponse::error('Pitch ID is required', 400);
        }

        if ($pitch->deletePitch($id)) {
            ApiResponse::success('Pitch deleted successfully');
        } else {
            ApiResponse::error('Pitch deletion failed', 500);
        }
        break;

    default:
        ApiResponse::error('Method not allowed', 405);
        break;
}
?>
