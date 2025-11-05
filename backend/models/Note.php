<?php
class Note {
    private $collection;
    
    public function __construct() {
        $db = Database::getInstance();
        $this->collection = $db->getCollection('notes');
    }
    
    public function create($noteData) {
        $noteData['created_at'] = new MongoDB\BSON\UTCDateTime();
        $noteData['updated_at'] = new MongoDB\BSON\UTCDateTime();
        
        $result = $this->collection->insertOne($noteData);
        return $result->getInsertedId();
    }
    
    public function findByAttendance($attendanceId) {
        return $this->collection->findOne(['attendance_id' => $attendanceId]);
    }
    
    public function getUserNotes($userId, $startDate = null, $endDate = null) {
        $filter = ['user_id' => $userId];
        
        if ($startDate && $endDate) {
            $filter['date'] = [
                '$gte' => $startDate,
                '$lte' => $endDate
            ];
        }
        
        return $this->collection->find($filter)->toArray();
    }
    
    public function update($id, $updateData) {
        $updateData['updated_at'] = new MongoDB\BSON\UTCDateTime();
        $result = $this->collection->updateOne(
            ['_id' => new MongoDB\BSON\ObjectId($id)],
            ['$set' => $updateData]
        );
        return $result->getModifiedCount();
    }
}
?>