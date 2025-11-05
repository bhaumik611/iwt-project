<?php
require_once '../models/Subject.php';
require_once '../middleware/AuthMiddleware.php';
require_once '../utils/Response.php';
require_once '../utils/Validator.php';

class SubjectController {
    private $subjectModel;
    
    public function __construct() {
        $this->subjectModel = new Subject();
    }
    
    public function create($data) {
        $user = AuthMiddleware::authenticate();
        
        $errors = Validator::validateRequired(['name', 'faculty', 'time', 'day', 'type'], $data);
        if (!empty($errors)) {
            Response::error(implode(', ', $errors));
        }
        
        $data['user_id'] = (string)$user['_id'];
        $subjectId = $this->subjectModel->create($data);
        
        Response::success(['subject_id' => (string)$subjectId], 'Subject created successfully');
    }
    
    public function getUserSubjects() {
        $user = AuthMiddleware::authenticate();
        $subjects = $this->subjectModel->findByUser((string)$user['_id']);
        
        Response::success(['subjects' => $subjects]);
    }
    
    public function update($id, $data) {
        $user = AuthMiddleware::authenticate();
        
        $subject = $this->subjectModel->findById($id);
        if (!$subject || $subject['user_id'] !== (string)$user['_id']) {
            Response::notFound('Subject not found');
        }
        
        $this->subjectModel->update($id, $data);
        Response::success(null, 'Subject updated successfully');
    }
    
    public function delete($id) {
        $user = AuthMiddleware::authenticate();
        
        $subject = $this->subjectModel->findById($id);
        if (!$subject || $subject['user_id'] !== (string)$user['_id']) {
            Response::notFound('Subject not found');
        }
        
        $this->subjectModel->delete($id);
        Response::success(null, 'Subject deleted successfully');
    }
}
?>