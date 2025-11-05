<?php
class User {
    private $collection;
    
    public function __construct() {
        $db = Database::getInstance();
        $this->collection = $db->getCollection('users');
    }
    
    public function create($userData) {
        $userData['created_at'] = new MongoDB\BSON\UTCDateTime();
        $userData['updated_at'] = new MongoDB\BSON\UTCDateTime();
        
        $result = $this->collection->insertOne($userData);
        return $result->getInsertedId();
    }
    
    public function findByUsername($username) {
        return $this->collection->findOne(['username' => $username]);
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