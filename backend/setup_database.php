<?php
require_once __DIR__ . '/config/database.php';

try {
    // Get database instance
    $db = Database::getInstance();
    
    // Create test documents for each collection
    $testDocs = [
        'users' => [
            'username' => 'test',
            'password' => 'test',
            'fullName' => 'Test User',
            'studentId' => 'TEST001',
            'course' => 'Test Course',
            'semester' => '1',
            'subjects' => [],
            'joinedDate' => new MongoDB\BSON\UTCDateTime(time() * 1000)
        ],
        'attendance' => [
            'userId' => 'test',
            'date' => new MongoDB\BSON\UTCDateTime(time() * 1000),
            'subjectId' => 'test_subject',
            'status' => 'present',
            'note' => 'Test attendance record'
        ],
        'subjects' => [
            'name' => 'Test Subject',
            'faculty' => 'Test Faculty',
            'day' => 'Monday',
            'time' => '09:00',
            'type' => 'theory',
            'theory' => [
                'hours' => 3,
                'credits' => 4,
                'notes' => 'Test theory notes'
            ]
        ]
    ];

    // Create collections if they don't exist
    $collections = [
        'users' => [
            'validator' => [
                '$jsonSchema' => [
                    'bsonType' => 'object',
                    'required' => ['username', 'password', 'fullName'],
                    'properties' => [
                        'username' => ['bsonType' => 'string'],
                        'password' => ['bsonType' => 'string'],
                        'fullName' => ['bsonType' => 'string'],
                        'studentId' => ['bsonType' => 'string'],
                        'course' => ['bsonType' => 'string'],
                        'semester' => ['bsonType' => 'string'],
                        'subjects' => ['bsonType' => 'array'],
                        'joinedDate' => ['bsonType' => 'date']
                    ]
                ]
            ],
            'testDoc' => $testDocs['users']
        ],
        'attendance' => [
            'validator' => [
                '$jsonSchema' => [
                    'bsonType' => 'object',
                    'required' => ['userId', 'date', 'subjectId', 'status'],
                    'properties' => [
                        'userId' => ['bsonType' => 'string'],
                        'date' => ['bsonType' => 'date'],
                        'subjectId' => ['bsonType' => 'string'],
                        'status' => ['bsonType' => 'string'],
                        'note' => ['bsonType' => 'string']
                    ]
                ]
            ],
            'testDoc' => $testDocs['attendance']
        ],
        'subjects' => [
            'validator' => [
                '$jsonSchema' => [
                    'bsonType' => 'object',
                    'required' => ['name', 'faculty', 'day', 'time'],
                    'properties' => [
                        'name' => ['bsonType' => 'string'],
                        'faculty' => ['bsonType' => 'string'],
                        'day' => ['bsonType' => 'string'],
                        'time' => ['bsonType' => 'string'],
                        'type' => ['bsonType' => 'string'],
                        'theory' => ['bsonType' => 'object'],
                        'practical' => ['bsonType' => 'object']
                    ]
                ]
            ],
            'testDoc' => $testDocs['subjects']
        ]
    ];
    
    foreach ($collections as $name => $options) {
        try {
            $collection = $db->getCollection($name);
            // Insert a test document to ensure collection is created
            if (isset($options['testDoc'])) {
                $collection->insertOne($options['testDoc']);
            }
            echo "Created collection: $name\n";
        } catch (Exception $e) {
            if (strpos($e->getMessage(), 'Collection already exists') === false) {
                throw $e;
            }
            echo "Collection already exists: $name\n";
        }
    }
    
    echo "\nDatabase setup completed successfully!\n";
} catch (Exception $e) {
    echo "Error setting up database: " . $e->getMessage() . "\n";
}
?>