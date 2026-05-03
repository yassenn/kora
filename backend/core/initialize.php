<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);

// Define App Root
define('APPROOT', dirname(__DIR__));

// Load Config
require_once APPROOT . '/config/database.php';

// Load Core Libraries
require_once APPROOT . '/core/auth.php';
require_once APPROOT . '/core/response.php';

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
