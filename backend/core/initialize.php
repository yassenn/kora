<?php
// Load Config
require_once 'config/database.php';

// Load Core Libraries
require_once 'core/auth.php';
require_once 'core/response.php';


// Autoload Core Libraries
spl_autoload_register(function($className){
    require_once 'core/' . $className . '.php';
});
