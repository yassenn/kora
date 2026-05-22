<?php
require_once '../../core/initialize.php';

// Rate Limiting: Max 60 requests per minute
$ip = $_SERVER['REMOTE_ADDR'];
if (!RateLimiter::check($_SERVER['SCRIPT_NAME'] . "_$ip", 60, 60)) {
    ApiResponse::error('Too many requests. Please try again later.', 429);
}

$db = new Database();

try {
    // Simple query to check DB connection
    $db->query("SELECT 1");
    $db->execute();
    
    $status = [
        'status' => 'ok',
        'timestamp' => time(),
        'environment' => getenv('APP_ENV') ?: 'development',
        'services' => [
            'database' => 'ok'
        ]
    ];
    ApiResponse::success('Service is healthy', $status);
} catch (Exception $e) {
    $status = [
        'status' => 'error',
        'timestamp' => time(),
        'environment' => getenv('APP_ENV') ?: 'development',
        'services' => [
            'database' => 'error'
        ],
        'error' => $e->getMessage()
    ];
    ApiResponse::error('Service unhealthy', 503);
}
