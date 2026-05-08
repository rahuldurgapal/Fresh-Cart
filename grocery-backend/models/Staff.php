<?php
class Staff {
    private $conn;
    private $table_name = "staff";

    public $id;
    public $name;
    public $email;
    public $phone;
    public $password;
    public $role;
    public $status;
    public $created_at;
    public $verification_code;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function emailExists() {
        $query = "SELECT id, name, email, phone, password, role, status, verification_code FROM " . $this->table_name . " WHERE email = ? OR phone = ? LIMIT 1";
        $stmt  = $this->conn->prepare($query);
        $stmt->bind_param("ss", $this->email, $this->phone);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $this->id       = $row['id'];
            $this->name     = $row['name'];
            $this->email    = $row['email'];
            $this->phone    = $row['phone'];
            $this->password = $row['password'];
            $this->role     = $row['role'];
            $this->status   = $row['status'];
            $this->verification_code = $row['verification_code'];
            return true;
        }
        return false;
    }

    public function setVerificationCode($code) {
        $query = "UPDATE " . $this->table_name . " SET verification_code = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("si", $code, $this->id);
        return $stmt->execute();
    }
}
?>
