<?php
// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods, Authorization, X-Requested-With');

include_once '../../core/initialize.php';

// Instantiate Pitch object
$pitch = new Pitch();

// Support GET to list pitches
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $result = $pitch->getPitches();
    echo json_encode($result);
    exit();
}

// Get raw posted data for POST
$data = json_decode(file_get_contents("php://input"));

if(empty($data->name) || empty($data->location) || empty($data->owner_id)) {
    // Bad request
    http_response_code(400);
    echo json_encode(['message' => 'Pitch creation failed. Incomplete data.']);
    exit();
}

// Set pitch properties
$pitch_data['name'] = $data->name;
$pitch_data['location'] = $data->location;
$pitch_data['owner_id'] = $data->owner_id;
$pitch_data['status'] = 'pending'; // Default status

// Create pitch
if($pitch->addPitch($pitch_data)) {
    echo json_encode(['success' => true, 'message' => 'Pitch created successfully.']);
} else {
    echo json_encode(['success' => false, 'message' => 'Pitch creation failed.']);
}
?>