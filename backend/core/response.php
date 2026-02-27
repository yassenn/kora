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
    public static function error($message = 'Error', $httpCode = 400) {
        http_response_code($httpCode);
        $response = [
            'success' => false,
            'message' => $message,
            'data' => null
        ];
        echo json_encode($response);
        exit();
    }

    /**
     * Send a validation error response
     */
    public static function validationError($message = 'Validation failed', $errors = null) {
        http_response_code(422);
        $response = [
            'success' => false,
            'message' => $message,
            'data' => $errors
        ];
        echo json_encode($response);
        exit();
    }
}

?>
