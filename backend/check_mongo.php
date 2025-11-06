<?php
require_once __DIR__ . '/config/database.php';

try {
    $db = Database::getInstance();
    $manager = $db->getManager();
    // run a ping again for good measure
    $cmd = new MongoDB\Driver\Command(['ping' => 1]);
    $result = $manager->executeCommand('IWT', $cmd);
    $resArray = current($result->toArray());
    echo "MongoDB connection OK. Ping response: " . json_encode($resArray) . PHP_EOL;
    exit(0);
} catch (Exception $e) {
    echo "MongoDB connection FAILED: " . $e->getMessage() . PHP_EOL;
    exit(2);
}
