<?php
require_once __DIR__ . '/config/database.php';

try {
    // Get database instance
    $db = Database::getInstance();
    
    // Drop existing collections to clear all data
    $existingCollections = ['users', 'attendance', 'subjects'];
    foreach ($existingCollections as $collection) {
        try {
            $db->getCollection($collection)->drop();
            echo "Dropped collection: $collection\n";
        } catch (Exception $e) {
            // Ignore if collection doesn't exist
        }
    }
    
    // Create fresh collections
    $collections = [
        'users' => [
            'username' => 'string',
            'password' => 'string',
            'fullName' => 'string',
            'studentId' => 'string',
            'course' => 'string',
            'semester' => 'string',
            'subjects' => 'array',
            'joinedDate' => 'date'
        ],
        'attendance' => [
            'userId' => 'string',
            'subjectId' => 'string',
            'date' => 'date',
            'status' => 'string',
            'note' => 'string'
        ],
        'subjects' => [
            'name' => 'string',
            'faculty' => 'string',
            'day' => 'string',
            'time' => 'string',
            'type' => 'string',
            'theory' => 'object',
            'practical' => 'object'
        ]
    ];

    foreach ($collections as $name => $schema) {
        $collection = $db->getCollection($name);
        echo "Created collection: $name\n";
    }

    echo "\nDatabase reset completed successfully!\n";
} catch (Exception $e) {
    echo "Error resetting database: " . $e->getMessage() . "\n";
}
?>