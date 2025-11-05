<?php
require_once '../models/User.php';
require_once '../utils/Response.php';
require_once '../utils/Validator.php';

class AuthController {
    private $userModel;
    
    public function __construct() {
        $this->userModel = new User();
    }
    
    public function login($data) {
        $errors = Validator::validateRequired(['username', 'password'], $data);
        if (!empty($errors)) {
            Response::error(implode(', ', $errors));
        }
        
        $user = $this->userModel->findByUsername($data['username']);
        
        if (!$user || !password_verify($data['password'], $user['password'])) {
            Response::error('Invalid username or password');
        }
        
        // Generate token (simplified - consider using JWT)
        $token = bin2hex(random_bytes(32));
        
        // Update user with token
        $this->userModel->update($user['_id'], ['token' => $token]);
        
        Response::success([
            'token' => $token,
            'user' => [
                'id' => (string)$user['_id'],
                'username' => $user['username'],
                'fullName' => $user['full_name'],
                'studentId' => $user['student_id'],
                'course' => $user['course'],
                'semester' => $user['semester']
            ]
        ], 'Login successful');
    }
    
    public function register($data) {
        $requiredFields = ['full_name', 'student_id', 'username', 'password', 'course', 'semester'];
        $errors = Validator::validateRequired($requiredFields, $data);
        
        if (!empty($errors)) {
            Response::error(implode(', ', $errors));
        }
        
        // Check if username already exists
        if ($this->userModel->findByUsername($data['username'])) {
            Response::error('Username already exists');
        }
        
        // Hash password
        $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        
        $userId = $this->userModel->create($data);
        
        Response::success(['user_id' => (string)$userId], 'Registration successful');
    }
    
    public function logout($data) {
        $user = AuthMiddleware::authenticate();
        $this->userModel->update($user['_id'], ['token' => null]);
        Response::success(null, 'Logout successful');
    }
}
?>