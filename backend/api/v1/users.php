<?php
require_once '../../core/initialize.php';

$user = new User();
$method = $_SERVER['REQUEST_METHOD'];
$ip = $_SERVER['REMOTE_ADDR'];

try {
    switch ($method) {
        case 'GET':
            // General Rate Limit: 60/min
            if (!RateLimiter::check($_SERVER['SCRIPT_NAME'] . "_$ip", 60, 60)) {
                ApiResponse::error('Too many requests. Please try again later.', 429);
            }

            if (isset($_GET['stats_for_user_id'])) {
                $decoded = requireBearerToken();
                $user_id = intval($_GET['stats_for_user_id']);
                
                // Only allow users to see their own stats unless they are admin
                if ($user_id !== $decoded->user_id && $decoded->user_type !== 'admin') {
                    ApiResponse::error('Unauthorized access to stats', 403);
                }

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
                $decoded = requireBearerToken(); // Require authentication to list users
                if (isset($_GET['search']) && strlen($_GET['search']) >= 2) {
                    $result = $user->searchUsers($_GET['search'], $decoded->user_id);
                    ApiResponse::success('Users retrieved', $result);
                } else {
                    ApiResponse::error('A search query of at least 2 characters is required', 400);
                }
            }
            break;

        case 'POST':
            $data = getJsonInput();
            
            if (isset($data['type']) && ($data['type'] == 'register' || $data['type'] == 'login')) {
                // Stricter Rate Limit for Auth: 5/min
                if (!RateLimiter::check("auth_{$data['type']}_$ip", 5, 60)) {
                    ApiResponse::error('Too many attempts. Please try again later.', 429);
                }

                if ($data['type'] == 'register') {
                    // Validate registration data
                    $errors = $user->getRegistrationErrors($data);
                    if (!empty($errors)) {
                        ApiResponse::validationError('Registration validation failed', $errors);
                    }

                    // Validate enum for user_type
                    Validator::validateEnum($data['user_type'], ['player', 'organizer', 'pitch_owner', 'admin'], 'user_type');

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
                        'user_type' => 'player' // Force player role for all self-registrations
                    ];

                    if ($user->register($register_data)) {
                        ApiResponse::success('Account created successfully! You can now login.');
                    } else {
                        ApiResponse::error('Registration failed. Please try again later.', 500);
                    }
                } else { // login
                    // Validate login data
                    if (empty($data['email']) || empty($data['password'])) {
                        ApiResponse::validationError('Email and password are required');
                    }

                    // Login user
                    $logged_in_user = $user->login($data['email'], $data['password']);
                    if ($logged_in_user) {
                        // Check if verified
                        if (!$logged_in_user->is_verified) {
                            $otp = sprintf("%06d", mt_rand(1, 999999));
                            $expiry = date('Y-m-d H:i:s', time() + 15 * 60);
                            $user->setVerificationCode($logged_in_user->id, $otp, $expiry);
                            
                            EmailManager::sendOTP($logged_in_user->email, $otp);

                            ApiResponse::error('Verification required', 403, [
                                'needs_verification' => true, 
                                'user_id' => (int)$logged_in_user->id
                            ]);
                        }

                        // Issue JWT
                        $payload = [
                            'user_id' => $logged_in_user->id,
                            'user_type' => $logged_in_user->user_type,
                            'exp' => time() + (int)(getenv('JWT_EXPIRATION') ?: 3600)
                        ];
                        $token = SimpleJWT::encode($payload);

                        // Set HttpOnly cookie for web clients (VULN-004)
                        setcookie('token', $token, [
                            'expires' => time() + (int)(getenv('JWT_EXPIRATION') ?: 3600),
                            'path' => '/',
                            'domain' => '', // Set to your domain in production
                            'secure' => true,
                            'httponly' => true,
                            'samesite' => 'Strict',
                        ]);

                        // Generate Refresh Token
                        $refreshTokenModel = new RefreshToken();
                        $refreshToken = $refreshTokenModel->create($logged_in_user->id);

                        // Sanitize user object (remove password)
                        unset($logged_in_user->password);

                        ApiResponse::success('Login successful', [
                            'user' => $logged_in_user,
                            'token' => $token,
                            'refresh_token' => $refreshToken
                        ]);
                    } else {
                        ApiResponse::error('Invalid email or password', 401);
                    }
                }
            } elseif (isset($data['type']) && $data['type'] == 'update_fcm_token') {
                $decoded = requireBearerToken();
                if (empty($data['fcm_token'])) {
                    ApiResponse::validationError('FCM token is required');
                }
                if ($user->updateFcmToken($decoded->user_id, $data['fcm_token'])) {
                    ApiResponse::success('FCM token updated successfully');
                } else {
                    ApiResponse::error('Failed to update FCM token', 500);
                }
            } else {
                ApiResponse::error('Invalid request type', 400);
            }
            break;
        
        case 'PUT':
            // General Rate Limit: 60/min
            if (!RateLimiter::check($_SERVER['SCRIPT_NAME'] . "_$ip", 60, 60)) {
                ApiResponse::error('Too many requests. Please try again later.', 429);
            }

            $decoded = requireBearerToken();
            $data = json_decode(file_get_contents("php://input"), true);

            if (empty($data['id']) || empty($data['user_type'])) {
                ApiResponse::error('User ID and type are required', 400);
            }
            
            // Only admin can update user types
            if ($decoded->user_type !== 'admin') {
                ApiResponse::error('Unauthorized: Admin access required', 403);
            }

            if ($user->updateUserType($data['id'], $data['user_type'])) {
                ApiResponse::success('User role updated successfully');
            } else {
                ApiResponse::error('Failed to update role', 500);
            }
            break;
        
        case 'DELETE':
            // General Rate Limit: 60/min
            if (!RateLimiter::check($_SERVER['SCRIPT_NAME'] . "_$ip", 60, 60)) {
                ApiResponse::error('Too many requests. Please try again later.', 429);
            }

            // Require authentication
            $decoded = requireBearerToken();
            $user_id = $decoded->user_id;

            if ($user->deleteUser($user_id)) {
                ApiResponse::success('Account and all associated data deleted successfully');
            } else {
                ApiResponse::error('Failed to delete account', 500);
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
