<?php
/*
 * Lightweight Database wrapper using the MongoDB PHP extension (Driver API)
 * This avoids loading the composer library which may be incompatible with
 * the installed PHP/mongodb extension versions on the host.
 *
 * Provides a minimal Collection object with `findOne($filter)` and
 * `insertOne($doc)` used by the rest of the project.
 */

class CollectionWrapper {
    private $manager;
    private $ns; // namespace: db.collection
    private $dbName;
    private $collName;

    public function __construct(MongoDB\Driver\Manager $manager, string $dbName, string $collName) {
        $this->manager = $manager;
        $this->dbName = $dbName;
        $this->collName = $collName;
        $this->ns = $dbName . '.' . $collName;
    }

    public function findOne(array $filter = []) {
        $query = new MongoDB\Driver\Query($filter, ['limit' => 1]);
        $cursor = $this->manager->executeQuery($this->ns, $query);
        foreach ($cursor as $doc) {
            return $doc; // return BSONDocument (iterable object)
        }
        return null;
    }

    public function insertOne(array $document) {
        $bulk = new MongoDB\Driver\BulkWrite();
        // if caller didn't set _id, create one so we can return it
        if (!isset($document['_id'])) {
            $document['_id'] = new MongoDB\BSON\ObjectId();
        }
        $id = $document['_id'];
        $bulk->insert($document);
        $result = $this->manager->executeBulkWrite($this->ns, $bulk);

        // Build a minimal result object compatible with existing code usage
        return new class($result, $id) {
            private $result;
            private $id;
            public function __construct($result, $id) { $this->result = $result; $this->id = $id; }
            public function isAcknowledged() {
                try { return method_exists(
                    \MongoDB\Driver\WriteResult::class, 'getInsertedCount') ? ($this->result->getInsertedCount() > 0) : true; }
                catch (\Throwable $t) { return true; }
            }
            public function getInsertedId() { return $this->id; }
        };
    }
}

class Database {
    private $manager;
    private $dbName = 'IWT';
    private static $instance = null;

    private function __construct() {
        try {
            // Use the MongoDB extension Manager directly
            $connectionString = "mongodb+srv://bhaumik6115:test123@cluster0.4hzs4dn.mongodb.net/" . $this->dbName . "?retryWrites=true&w=majority";
            $this->manager = new MongoDB\Driver\Manager($connectionString);
            // Test connection by running a cheap command
            $cmd = new MongoDB\Driver\Command(['ping' => 1]);
            $this->manager->executeCommand($this->dbName, $cmd);
        } catch (Exception $e) {
            error_log("Database connection failed: " . $e->getMessage());
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getCollection($name) {
        return new CollectionWrapper($this->manager, $this->dbName, $name);
    }

    public function getManager() {
        return $this->manager;
    }
}

?>