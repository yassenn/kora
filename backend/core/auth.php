<?php
/**
 * Token Validation Middleware
 * 
 * Validates Bearer tokens from the Authorization header.
 * Currently performs basic token format validation.
 * Future: Implement JWT verification and token expiration checks.
 */

function validateBearerToken() {
    $authHeader = null;
    $token = null;
    
    // Try getallheaders()
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
        } elseif (isset($headers['authorization'])) {
            $authHeader = $headers['authorization'];
        }
    }
    
    // Try $_SERVER
    if (!$authHeader) {
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }
    }
    
    if ($authHeader && strpos($authHeader, 'Bearer ') === 0) {
        $token = substr($authHeader, 7);
    }
    
    // Fallback to cookie for web clients (VULN-004 fix)
    if (!$token && isset($_COOKIE['token'])) {
        $token = $_COOKIE['token'];
    }
    
    if (empty($token)) {
        return null;
    }
    
    // Verify JWT
    $decoded = SimpleJWT::decode($token);
    if (!$decoded) {
        return null;
    }
    
    return $decoded; // Returns payload (e.g., user_id)
}

/**
 * Require Bearer Token
 * 
 * Call this function at the start of any endpoint that requires authentication.
 * Returns the token if valid, or terminates the request with a 401 error.
 */
function requireBearerToken() {
    $token = validateBearerToken();
    
    if (!$token) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Missing or invalid Authorization header']);
        exit();
    }
    
    return $token;
}

?>
