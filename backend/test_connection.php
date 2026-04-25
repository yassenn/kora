<?php
require_once 'config/database.php';

header('Content-Type: application/json');

try {
    $db = new Database();
    // Try a simple query
    $db->query("SELECT 1");
    $db->execute();
    echo json_encode([
        "success" => true,
        "message" => "Backend successfully connected to the database."
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed: " . $e->getMessage()
    ]);
}
?>