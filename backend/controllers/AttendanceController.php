<?php
require_once '../models/Attendance.php';
require_once '../models/Note.php';
require_once '../middleware/AuthMiddleware.php';
require_once '../utils/Response.php';
require_once '../utils/Validator.php';

class AttendanceController {
    private $attendanceModel;
    private $noteModel;
    
    public function __construct() {
        $this->attendanceModel = new Attendance();
        $this->noteModel = new Note();
    }
    
    public function markAttendance($data) {
        $user = AuthMiddleware::authenticate();
        
        $errors = Validator::validateRequired(['subject_id', 'date', 'status'], $data);
        if (!empty($errors)) {
            Response::error(implode(', ', $errors));
        }
        
        $data['user_id'] = (string)$user['_id'];
        $attendanceId = $this->attendanceModel->markAttendance($data);
        
        // If note is provided, save it
        if (isset($data['note']) && !empty(trim($data['note']))) {
            $noteData = [
                'user_id' => (string)$user['_id'],
                'attendance_id' => (string)$attendanceId,
                'subject_id' => $data['subject_id'],
                'date' => $data['date'],
                'content' => $data['note']
            ];
            $this->noteModel->create($noteData);
        }
        
        Response::success(['attendance_id' => (string)$attendanceId], 'Attendance marked successfully');
    }
    
    public function getUserAttendance($params) {
        $user = AuthMiddleware::authenticate();
        
        $startDate = $params['start_date'] ?? null;
        $endDate = $params['end_date'] ?? null;
        
        $attendance = $this->attendanceModel->getUserAttendance((string)$user['_id'], $startDate, $endDate);
        Response::success(['attendance' => $attendance]);
    }
    
    public function getAttendanceStats() {
        $user = AuthMiddleware::authenticate();
        $stats = $this->attendanceModel->getAttendanceStats((string)$user['_id']);
        
        Response::success(['stats' => $stats]);
    }
}
?>