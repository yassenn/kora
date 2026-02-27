<?php
// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods, Authorization, X-Requested-With');

include_once '../../core/initialize.php';

// Instantiate Pitch object
$pitch = new Pitch();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $result = $pitch->getPitches();
    ApiResponse::success('Pitches retrieved', $result);
}

// Get raw posted data for POST
$data = json_decode(file_get_contents("php://input"), true);

// Validate pitch data
$errors = [];
if (empty($data['name'])) {
    $errors['name'] = 'Pitch name is required';
}
if (empty($data['location'])) {
    $errors['location'] = 'Pitch location is required';
}
if (empty($data['owner_id']) || !is_numeric($data['owner_id']) || intval($data['owner_id']) <= 0) {
    $errors['owner_id'] = 'Valid owner ID is required';
}

if (!empty($errors)) {
    ApiResponse::validationError('Pitch creation validation failed', $errors);
}

// Set pitch properties
$pitch_data['name'] = $data['name'];
$pitch_data['location'] = $data['location'];
$pitch_data['owner_id'] = $data['owner_id'];
$pitch_data['status'] = 'pending'; // Default status

// Create pitch
if ($pitch->addPitch($pitch_data)) {
    ApiResponse::success('Pitch created successfully');
} else {
    ApiResponse::error('Pitch creation failed', 500);
}
?>