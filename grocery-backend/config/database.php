<?php
class Database {
    private $host = "127.0.0.1";
    private $db_name = "grocery_db";
    private $username = "root";
    private $password = "";
    private $jwt_secret = "freshcart_secure_secret_key_2026_@!";
    public $conn;

    public function getJWTSecret() {
        return $this->jwt_secret;
    }

    public function get2FactorApiKey() {
        // Replace with your actual 2Factor.in API Key
        return "1a0426be-4a46-11f1-9800-0200cd936042";
    }

    private static $instance = null;

    public function getConnection() {
        if (self::$instance === null) {
            self::$instance = new mysqli($this->host, $this->username, $this->password, $this->db_name);

            if (self::$instance->connect_error) {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Connection failed: " . self::$instance->connect_error]);
                exit;
            }

            self::$instance->set_charset("utf8mb4");
        }
        
        $this->conn = self::$instance;
        return $this->conn;
    }
}
?>
