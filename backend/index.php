<?php
// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Autoload classes
spl_autoload_register(function ($class) {
    $paths = [
        'config/',
        'models/',
        'controllers/',
        'middleware/',
        'utils/',
        'routes/'
    ];
    
    foreach ($paths as $path) {
        $file = __DIR__ . '/' . $path . $class . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

try {
    // Include routes
    require_once 'routes/api.php';
} catch (Exception $e) {
    error_log("Application error: " . $e->getMessage());
    Response::error("Internal server error", 500);
}
?>