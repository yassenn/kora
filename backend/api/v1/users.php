<?php
require_once '../../core/initialize.php';

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$user = new User();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['stats_for_user_id'])) {
            $user_id = intval($_GET['stats_for_user_id']);
            if ($user_id <= 0) {
                ApiResponse::validationError('Invalid user ID');
            }
            $stats = $user->getUserStats($user_id);
            if ($stats) {
                ApiResponse::success('User stats retrieved', $stats);
            } else {
                ApiResponse::error('Stats not found', 404);
            }
        } else {
            $result = $user->getUsers();
            ApiResponse::success('Users retrieved', $result);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (isset($data['type']) && $data['type'] == 'register') {
            // Validate registration data
            $errors = $user->getRegistrationErrors($data);
            if (!empty($errors)) {
                ApiResponse::validationError('Registration validation failed', $errors);
            }

            // Check if email already exists
            if ($user->findUserByEmail($data['email'])) {
                ApiResponse::error('This email is already registered', 409);
            }

            // Check if username already exists
            if ($user->findUserByUsername($data['username'])) {
                ApiResponse::error('This username is already taken', 409);
            }

            // Register user
            $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);
            $register_data = [
                'username' => $data['username'],
                'email' => $data['email'],
                'password' => $hashed_password,
                'user_type' => $data['user_type'] ?? 'player'
            ];

            if ($user->register($register_data)) {
                ApiResponse::success('Account created successfully! You can now login.');
            } else {
                ApiResponse::error('Registration failed. Please try again later.', 500);
            }
        } elseif (isset($data['type']) && $data['type'] == 'login') {
            // Validate login data
            if (empty($data['email']) || empty($data['password'])) {
                ApiResponse::validationError('Email and password are required');
            }

            // Login user
            $logged_in_user = $user->login($data['email'], $data['password']);
            if ($logged_in_user) {
                ApiResponse::success('Login successful', $logged_in_user);
            } else {
                ApiResponse::error('Invalid email or password', 401);
            }
        } else {
            ApiResponse::error('Invalid request type', 400);
        }
        break;
    
    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['id']) || empty($data['user_type'])) {
            ApiResponse::error('User ID and type are required', 400);
        }
        
        if ($user->updateUserType($data['id'], $data['user_type'])) {
            ApiResponse::success('User role updated successfully');
        } else {
            ApiResponse::error('Failed to update role', 500);
        }
        break;
    
    default:
        ApiResponse::error('Method not allowed', 405);
        break;
}
?>
