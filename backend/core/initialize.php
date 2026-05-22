<?php
// Load Environment Variables
$envFile = dirname(__DIR__) . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
            putenv(sprintf('%s=%s', $name, $value));
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}

// Environment-based Error Reporting
if (getenv('APP_ENV') === 'production') {
    error_reporting(0);
    ini_set("display_errors", 0);
} else {
    error_reporting(E_ALL);
    ini_set("display_errors", 0);
}

// Define App Root
define('APPROOT', dirname(__DIR__));

// CORS and Security Headers
$allowedOrigin = getenv('CORS_ALLOWED_ORIGIN') ?: '*';
if ($allowedOrigin !== '*' && isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] === $allowedOrigin) {
    header("Access-Control-Allow-Origin: $allowedOrigin");
} else if ($allowedOrigin === '*') {
    header("Access-Control-Allow-Origin: *");
}

header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE, PATCH');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Handle preflight requests globally
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

/**
 * Global Input Sanitization
 */
function sanitizeInput($data) {
    if (is_array($data)) {
        foreach ($data as $key => $value) {
            $data[$key] = sanitizeInput($value);
        }
    } else if (is_string($data)) {
        // Remove tags, trim, and convert special characters
        $data = trim($data);
        $data = strip_tags($data);
        $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    }
    return $data;
}

// Sanitize standard superglobals
$_GET = sanitizeInput($_GET);
$_POST = sanitizeInput($_POST);

// Helper for JSON input sanitization
function getJsonInput() {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);
    return sanitizeInput($data) ?: [];
}

/**
 * Input Validator
 */
class Validator {
    public static function validateEnum($value, $allowed, $fieldName) {
        if (!in_array($value, $allowed)) {
            $activity = new SuspiciousActivity();
            $decoded = validateBearerToken();
            $activity->log("INVALID_ENUM_VALUE", [
                'field' => $fieldName,
                'sent_value' => $value,
                'allowed_values' => $allowed
            ], $decoded ? $decoded->user_id : null);

            ApiResponse::validationError("Invalid value for $fieldName. Allowed values are: " . implode(', ', $allowed));
        }
        return $value;
    }

    public static function validateRequired($data, $fields) {
        $errors = [];
        foreach ($fields as $field) {
            if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
                $errors[$field] = ucfirst($field) . " is required";
            }
        }
        if (!empty($errors)) {
            $activity = new SuspiciousActivity();
            $decoded = validateBearerToken();
            $activity->log("MISSING_REQUIRED_FIELDS", [
                'errors' => $errors,
                'received_data' => $data
            ], $decoded ? $decoded->user_id : null);

            ApiResponse::validationError("Missing required fields", $errors);
        }
    }
}

/**
 * Utility: Detect potential contact info (phone numbers, etc.)
 */
function hasContactInfo($text) {
    // Basic regex for phone numbers (e.g., +123..., 07..., etc.)
    $phonePattern = '/(\+?[0-9]{1,4}[-\s]?)?\(?[0-9]{3}\)?[\s.-]?[0-9]{3}[\s.-]?[0-9]{4,}/';
    // Social handles or keywords
    $socialPattern = '/(@[A-Za-z0-9_]{3,}|whatsapp|telegram|call me|phone)/i';
    
    return preg_match($phonePattern, $text) || preg_match($socialPattern, $text);
}

// Load Config
require_once APPROOT . '/config/database.php';

// Load Core Libraries
require_once APPROOT . '/core/jwt.php';
require_once APPROOT . '/core/auth.php';
require_once APPROOT . '/core/response.php';
require_once APPROOT . '/core/RateLimiter.php';
require_once APPROOT . '/core/NotificationManager.php';
require_once APPROOT . '/core/EmailManager.php';

// Autoload Core Libraries (optional, keeping for compatibility if needed elsewhere)
spl_autoload_register(function($className){
    $file = APPROOT . '/core/' . $className . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
    
    // Also check models
    $modelFile = APPROOT . '/models/' . $className . '.php';
    if (file_exists($modelFile)) {
        require_once $modelFile;
    }
});

// Explicitly load models to be safe
require_once APPROOT . '/models/User.php';
require_once APPROOT . '/models/Match.php';
require_once APPROOT . '/models/Pitch.php';
require_once APPROOT . '/models/Notification.php';
require_once APPROOT . '/models/Review.php';
require_once APPROOT . '/models/Invitation.php';
require_once APPROOT . '/models/Warning.php';
require_once APPROOT . '/models/Friend.php';
require_once APPROOT . '/models/RefreshToken.php';
require_once APPROOT . '/models/SuspiciousActivity.php';
