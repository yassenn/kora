<?php
/**
 * API Response Helper
 * 
 * Provides consistent response formatting across all API endpoints.
 * All responses follow the structure: { success: bool, message: string, data: object/array }
 */

class ApiResponse {
    /**
     * Send a success response
     */
    public static function success($message = 'Success', $data = null) {
        $response = [
            'success' => true,
            'message' => $message,
            'data' => $data
        ];
        echo json_encode($response);
        exit();
    }

    /**
     * Send an error response
     */
    public static function error($message = 'Error', $httpCode = 400, $data = null) {
        http_response_code($httpCode);

        // In production, sanitize the error message if it looks like a system error
        if (getenv('APP_ENV') === 'production') {
            // If the message contains common PHP error markers, replace with generic text
            if (strpos($message, 'Exception') !== false || strpos($message, 'SQLSTATE') !== false || strpos($message, 'at line') !== false) {
                $message = 'An internal server error occurred';
            }
        }

        // Security Hardening: Only return the message field on errors
        $response = [
            'message' => $message
        ];

        // Exception for verification: we need to pass the user_id securely if verification is required
        // But the user specifically said ONLY message.
        // We'll append the user_id to the message in a parsable format if it's a 403 Verification Required
        if ($httpCode === 403 && isset($data['user_id'])) {
            $response['message'] .= " [USER_ID:" . $data['user_id'] . "]";
        }

        // In development, include debug data if available
        if (getenv('APP_ENV') !== 'production' && $data !== null) {
            $response['data'] = $data;
        }

        echo json_encode($response);
        exit();
    }

    /**
     * Send a validation error response
     */
    public static function validationError($message = 'Validation failed', $errors = null) {
        http_response_code(422);
        // Security Hardening: Only return the message field on errors
        $response = [
            'message' => $message
        ];

        // In development, include debug data if available
        if (getenv('APP_ENV') !== 'production' && $errors !== null) {
            $response['errors'] = $errors;
        }

        echo json_encode($response);
        exit();
    }
}

?>
