<?php
// Send CORS headers (single consolidated block)
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight OPTIONS request early and exit with no body
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// PHP error handling: do NOT display errors to the client (they produce HTML)
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/register_error.log');

// Simple request logging for debugging (does not send to client)
file_put_contents(__DIR__ . '/register_log.txt', "\n---- Registration attempt at " . date('Y-m-d H:i:s') . " ----\n", FILE_APPEND);

require_once __DIR__ . '/../config/database.php';

try {
    // Get raw posted data and log it
    $rawInput = file_get_contents("php://input");
    file_put_contents(__DIR__ . '/register_log.txt', "Raw input: " . $rawInput . "\n", FILE_APPEND);

    // Decode JSON and validate
    $data = json_decode($rawInput);
    if (json_last_error() !== JSON_ERROR_NONE) {
        file_put_contents(__DIR__ . '/register_log.txt', "JSON decode error: " . json_last_error_msg() . "\n", FILE_APPEND);
        throw new Exception('Invalid JSON payload: ' . json_last_error_msg());
    }
    
    // Validate required fields
    if (!isset($data->username) || !isset($data->password) || !isset($data->fullName)) {
        throw new Exception('Missing required fields');
    }
    
    // Get database instance
    $db = Database::getInstance();
    $users = $db->getCollection('users');
    
    // Check if username already exists
    $existingUser = $users->findOne(['username' => $data->username]);
    if ($existingUser) {
        throw new Exception('Username already exists');
    }
    
    // Prepare user document
    $userDoc = [
        'username' => $data->username,
        'password' => $data->password,
        'fullName' => $data->fullName,
        'studentId' => $data->studentId ?? '',
        'course' => $data->course ?? '',
        'semester' => $data->semester ?? '',
        'subjects' => [],
        'joinedDate' => new MongoDB\BSON\UTCDateTime()
    ];
    
    // Insert user
    $result = $users->insertOne($userDoc);
    file_put_contents(__DIR__ . '/register_log.txt', "Insert result: " . json_encode([ 'acknowledged' => $result->isAcknowledged(), 'insertedId' => (string)$result->getInsertedId() ]) . "\n", FILE_APPEND);

    if ($result->isAcknowledged()) {
        $out = [
            'success' => true,
            'message' => 'User registered successfully',
            'userId' => (string)$result->getInsertedId()
        ];
        echo json_encode($out);
        // Normal exit to avoid accidental output
        exit();
    } else {
        throw new Exception('Failed to register user');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    $errOut = [
        'success' => false,
        'message' => $e->getMessage()
    ];
    // Log the error response
    file_put_contents(__DIR__ . '/register_log.txt', "Error response: " . json_encode($errOut) . "\n", FILE_APPEND);
    echo json_encode($errOut);
    exit();
}
?>