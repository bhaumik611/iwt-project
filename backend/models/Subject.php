<?php
class Subject {
    private $collection;
    
    public function __construct() {
        $db = Database::getInstance();
        $this->collection = $db->getCollection('subjects');
    }
    
    public function create($subjectData) {
        $subjectData['created_at'] = new MongoDB\BSON\UTCDateTime();
        $subjectData['updated_at'] = new MongoDB\BSON\UTCDateTime();
        
        $result = $this->collection->insertOne($subjectData);
        return $result->getInsertedId();
    }
    
    public function findByUser($userId) {
        return $this->collection->find(['user_id' => $userId])->toArray();
    }
    
    public function findById($id) {
        return $this->collection->findOne(['_id' => new MongoDB\BSON\ObjectId($id)]);
    }
    
    public function update($id, $updateData) {
        $updateData['updated_at'] = new MongoDB\BSON\UTCDateTime();
        $result = $this->collection->updateOne(
            ['_id' => new MongoDB\BSON\ObjectId($id)],
            ['$set' => $updateData]
        );
        return $result->getModifiedCount();
    }
    
    public function delete($id) {
        $result = $this->collection->deleteOne(['_id' => new MongoDB\BSON\ObjectId($id)]);
        return $result->getDeletedCount();
    }
}
?>