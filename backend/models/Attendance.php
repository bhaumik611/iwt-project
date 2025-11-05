<?php
class Attendance {
    private $collection;
    
    public function __construct() {
        $db = Database::getInstance();
        $this->collection = $db->getCollection('attendance');
    }
    
    public function markAttendance($attendanceData) {
        $attendanceData['created_at'] = new MongoDB\BSON\UTCDateTime();
        
        // Check if attendance already exists for this user, date, and subject
        $existing = $this->collection->findOne([
            'user_id' => $attendanceData['user_id'],
            'date' => $attendanceData['date'],
            'subject_id' => $attendanceData['subject_id']
        ]);
        
        if ($existing) {
            // Update existing record
            $result = $this->collection->updateOne(
                ['_id' => $existing['_id']],
                ['$set' => [
                    'status' => $attendanceData['status'],
                    'updated_at' => new MongoDB\BSON\UTCDateTime()
                ]]
            );
            return $result->getModifiedCount();
        } else {
            // Insert new record
            $result = $this->collection->insertOne($attendanceData);
            return $result->getInsertedId();
        }
    }
    
    public function getUserAttendance($userId, $startDate = null, $endDate = null) {
        $filter = ['user_id' => $userId];
        
        if ($startDate && $endDate) {
            $filter['date'] = [
                '$gte' => $startDate,
                '$lte' => $endDate
            ];
        }
        
        return $this->collection->find($filter)->toArray();
    }
    
    public function getAttendanceByDate($userId, $date) {
        return $this->collection->find([
            'user_id' => $userId,
            'date' => $date
        ])->toArray();
    }
    
    public function getAttendanceStats($userId) {
        $pipeline = [
            ['$match' => ['user_id' => $userId]],
            ['$group' => [
                '_id' => '$status',
                'count' => ['$sum' => 1]
            ]]
        ];
        
        return $this->collection->aggregate($pipeline)->toArray();
    }
}
?>