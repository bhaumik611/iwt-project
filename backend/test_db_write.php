<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/models/Subject.php';
require_once __DIR__ . '/models/Attendance.php';

try {
    $db = Database::getInstance();
    echo "DB OK\n";

    $subjectModel = new Subject();
    $attendanceModel = new Attendance();

    // create a test subject
    $subjectData = [
        'user_id' => 'test-user-123',
        'name' => 'Test Subject',
        'faculty' => 'Test Faculty',
        'day' => 'monday',
        'time' => '09:00'
    ];
    $insertId = $subjectModel->create($subjectData);
    echo "Inserted subject id: " . ((string)$insertId) . "\n";

    // find subjects for user
    $subjects = $subjectModel->findByUser('test-user-123');
    echo "Subjects count: " . count($subjects) . "\n";

    // mark attendance
    $attendanceData = [
        'user_id' => 'test-user-123',
        'subject_id' => (string)$insertId,
        'date' => date('Y-m-d'),
        'status' => 'present'
    ];
    $res = $attendanceModel->markAttendance($attendanceData);
    echo "markAttendance result: ";
    if (is_object($res)) {
        // could be WriteResult wrapper or inserted id
        echo "object returned\n";
    } else {
        echo $res . "\n";
    }

    // query attendance
    $att = $attendanceModel->getAttendanceByDate('test-user-123', date('Y-m-d'));
    echo "Attendance records for today: " . count($att) . "\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
