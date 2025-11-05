<?php
require_once '../controllers/AuthController.php';
require_once '../controllers/SubjectController.php';
require_once '../controllers/AttendanceController.php';

class Router {
    private $routes = [];
    
    public function addRoute($method, $path, $callback) {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'callback' => $callback
        ];
    }
    
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $path = str_replace('/backend', '', $path); // Adjust based on your setup
        
        foreach ($this->routes as $route) {
            if ($route['method'] === $method && $this->matchPath($route['path'], $path, $params)) {
                $data = $this->getRequestData();
                call_user_func($route['callback'], array_merge($params, $data));
                return;
            }
        }
        
        Response::notFound("Route not found");
    }
    
    private function matchPath($routePath, $requestPath, &$params) {
        $routeParts = explode('/', trim($routePath, '/'));
        $requestParts = explode('/', trim($requestPath, '/'));
        
        if (count($routeParts) !== count($requestParts)) {
            return false;
        }
        
        $params = [];
        for ($i = 0; $i < count($routeParts); $i++) {
            if (strpos($routeParts[$i], ':') === 0) {
                $paramName = substr($routeParts[$i], 1);
                $params[$paramName] = $requestParts[$i];
            } elseif ($routeParts[$i] !== $requestParts[$i]) {
                return false;
            }
        }
        
        return true;
    }
    
    private function getRequestData() {
        $data = [];
        
        if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
            $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
            
            if (strpos($contentType, 'application/json') !== false) {
                $input = file_get_contents('php://input');
                $data = json_decode($input, true) ?? [];
            } else {
                $data = $_POST;
            }
        } elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
            $data = $_GET;
        }
        
        return Validator::sanitize($data);
    }
}

// Initialize router
$router = new Router();

// Auth routes
$router->addRoute('POST', '/api/auth/login', function($data) {
    $authController = new AuthController();
    $authController->login($data);
});

$router->addRoute('POST', '/api/auth/register', function($data) {
    $authController = new AuthController();
    $authController->register($data);
});

$router->addRoute('POST', '/api/auth/logout', function($data) {
    $authController = new AuthController();
    $authController->logout($data);
});

// Subject routes
$router->addRoute('POST', '/api/subjects', function($data) {
    $subjectController = new SubjectController();
    $subjectController->create($data);
});

$router->addRoute('GET', '/api/subjects', function($data) {
    $subjectController = new SubjectController();
    $subjectController->getUserSubjects();
});

$router->addRoute('PUT', '/api/subjects/:id', function($data) {
    $subjectController = new SubjectController();
    $subjectController->update($data['id'], $data);
});

$router->addRoute('DELETE', '/api/subjects/:id', function($data) {
    $subjectController = new SubjectController();
    $subjectController->delete($data['id']);
});

// Attendance routes
$router->addRoute('POST', '/api/attendance', function($data) {
    $attendanceController = new AttendanceController();
    $attendanceController->markAttendance($data);
});

$router->addRoute('GET', '/api/attendance', function($data) {
    $attendanceController = new AttendanceController();
    $attendanceController->getUserAttendance($data);
});

$router->addRoute('GET', '/api/attendance/stats', function($data) {
    $attendanceController = new AttendanceController();
    $attendanceController->getAttendanceStats();
});

// Handle the request
$router->handleRequest();
?>