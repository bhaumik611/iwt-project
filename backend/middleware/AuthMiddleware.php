<?php
class AuthMiddleware {
    public static function authenticate() {
        $headers = apache_request_headers();
        $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;
        
        if (!$token) {
            Response::unauthorized("Authentication token required");
        }
        
        // Verify token (you can use JWT or store sessions in MongoDB)
        $userModel = new User();
        $user = $userModel->findByToken($token); // You'll need to implement this method
        
        if (!$user) {
            Response::unauthorized("Invalid token");
        }
        
        return $user;
    }
}
?>