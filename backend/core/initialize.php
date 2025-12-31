<?php
// Load Config
require_once 'config/database.php';

// Load Models
require_once 'models/User.php';
require_once 'models/Pitch.php';
require_once 'models/Match.php';

// Autoload Core Libraries
spl_autoload_register(function($className){
    require_once 'core/' . $className . '.php';
});
