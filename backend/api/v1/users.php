<?php
require_once '../../core/initialize.php';

// Headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods, Authorization, X-Requested-With');


$user = new User();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['stats_for_user_id'])) {
            $stats = $user->getUserStats($_GET['stats_for_user_id']);
            if ($stats) {
                echo json_encode($stats);
            } else {
                echo json_encode(['message' => 'Stats not found']);
            }
        } else {
            $result = $user->getUsers();
            echo json_encode($result);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        if (isset($data->type) && $data->type == 'register') {
            // Register user
            $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);
            $register_data = [
                'username' => $data->username,
                'email' => $data->email,
                'password' => $hashed_password,
                'user_type' => $data->user_type
            ];

            if ($user->register($register_data)) {
                echo json_encode(['message' => 'User registered']);
            } else {
                echo json_encode(['message' => 'User not registered']);
            }
        } elseif (isset($data->type) && $data->type == 'login') {
            // Login user
            $logged_in_user = $user->login($data->email, $data->password);
            if ($logged_in_user) {
                echo json_encode($logged_in_user);
            } else {
                echo json_encode(['message' => 'Login failed']);
            }
        } else {
            echo json_encode(['message' => 'Invalid request type']);
        }
        break;
    
    default:
        header('HTTP/1.0 405 Method Not Allowed');
        echo json_encode(['message' => 'Method not allowed']);
        break;
}
?>
