<?php
/**
 * Token Validation Middleware
 * 
 * Validates Bearer tokens from the Authorization header.
 * Currently performs basic token format validation.
 * Future: Implement JWT verification and token expiration checks.
 */

function validateBearerToken() {
    $headers = getallheaders();
    
    if (!isset($headers['Authorization'])) {
        return null;
    }
    
    $authHeader = $headers['Authorization'];
    
    // Check if the Authorization header starts with "Bearer "
    if (strpos($authHeader, 'Bearer ') !== 0) {
        return null;
    }
    
    // Extract the token
    $token = substr($authHeader, 7);
    
    // Validate token is not empty
    if (empty($token)) {
        return null;
    }
    
    // TODO: Implement JWT verification here
    // For now, we return the token if it's present and properly formatted
    return $token;
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
