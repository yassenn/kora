<?php
require_once '../../core/initialize.php';

// Rate Limiting: Max 60 requests per minute
$ip = $_SERVER['REMOTE_ADDR'];
if (!RateLimiter::check($_SERVER['SCRIPT_NAME'] . "_$ip", 60, 60)) {
    ApiResponse::error('Too many requests. Please try again later.', 429);
}

// Instantiate Pitch object
$pitch = new Pitch();
$method = $_SERVER['REQUEST_METHOD'];

try {
    // Determine if requester is admin for data redaction
    $decoded = validateBearerToken();
    $isAdmin = ($decoded && $decoded->user_type === 'admin');

    switch ($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                $result = $pitch->getPitchById(intval($_GET['id']), $isAdmin);
                if ($result) {
                    ApiResponse::success('Pitch retrieved', $result);
                } else {
                    ApiResponse::error('Pitch not found', 404);
                }
            } elseif (isset($_GET['recent'])) {
                $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 5;
                $result = $pitch->getRecentPitches($limit, $isAdmin);
                ApiResponse::success('Recent pitches retrieved', $result);
            } else {
                $result = $pitch->getPitches(); // getPitches already excludes contact info
                ApiResponse::success('Pitches retrieved', $result);
            }
            break;

        case 'POST':
            $decoded = requireBearerToken();
            if ($decoded->user_type !== 'admin' && $decoded->user_type !== 'owner') {
                ApiResponse::error('Unauthorized: Admin or Owner access required', 403);
            }

            // Get raw posted data
            $data = getJsonInput();

            if (!$data) {
                ApiResponse::error('Invalid JSON input', 400);
            }

            // Force owner_id to be the authenticated user
            $data['owner_id'] = $decoded->user_id;

            // Validate status if provided
            if (isset($data['status'])) Validator::validateEnum($data['status'], ['pending', 'approved', 'denied'], 'status');

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
            $decoded = requireBearerToken();
            if ($decoded->user_type !== 'admin' && $decoded->user_type !== 'owner') {
                ApiResponse::error('Unauthorized: Admin or Owner access required', 403);
            }

            $data = getJsonInput();
            if (!$data || empty($data['id'])) {
                ApiResponse::error('Pitch ID is required', 400);
            }

            // Authorization check: User must own the pitch or be an admin
            $existing_pitch = $pitch->getPitchById($data['id']);
            if (!$existing_pitch || ($existing_pitch->owner_id != $decoded->user_id && $decoded->user_type !== 'admin')) {
                ApiResponse::error('Unauthorized to update this pitch', 403);
            }

            if (isset($data['status'])) Validator::validateEnum($data['status'], ['pending', 'approved', 'denied'], 'status');

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
            $decoded = requireBearerToken();
            if ($decoded->user_type !== 'admin' && $decoded->user_type !== 'owner') {
                ApiResponse::error('Unauthorized: Admin or Owner access required', 403);
            }

            $data = getJsonInput();
            $id = $data['id'] ?? $_GET['id'] ?? null;

            if (!$id) {
                ApiResponse::error('Pitch ID is required', 400);
            }

            // Authorization check: User must own the pitch or be an admin
            $existing_pitch = $pitch->getPitchById($id);
            if (!$existing_pitch || ($existing_pitch->owner_id != $decoded->user_id && $decoded->user_type !== 'admin')) {
                ApiResponse::error('Unauthorized to delete this pitch', 403);
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
} catch (Exception $e) {
    ApiResponse::error('An unexpected error occurred: ' . $e->getMessage(), 500);
}
?>
