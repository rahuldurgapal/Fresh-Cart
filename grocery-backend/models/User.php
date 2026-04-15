<?php
class User {
    private $conn;
    private $table_name = "users";

    public $id;
    public $name;
    public $email;
    public $phone;
    public $password;
    public $role;
    public $status;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function register() {
        if ($this->emailExists()) {
            return false;
        }

        $query = "INSERT INTO " . $this->table_name . " (name, email, phone, password, role, status) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt  = $this->conn->prepare($query);

        $hashed_password = password_hash($this->password, PASSWORD_BCRYPT);

        $stmt->bind_param("ssssss", $this->name, $this->email, $this->phone, $hashed_password, $this->role, $this->status);

        if ($stmt->execute()) {
            $this->id = $this->conn->insert_id;
            return true;
        }
        return false;
    }

    public function updateProfile() {
        $query = "UPDATE " . $this->table_name . " SET name = ?, phone = ? WHERE id = ?";
        $stmt  = $this->conn->prepare($query);
        $stmt->bind_param("ssi", $this->name, $this->phone, $this->id);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function emailExists() {
        $query = "SELECT id, name, phone, password, role, status FROM " . $this->table_name . " WHERE email = ? LIMIT 1";
        $stmt  = $this->conn->prepare($query);
        $stmt->bind_param("s", $this->email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $this->id       = $row['id'];
            $this->name     = $row['name'];
            $this->phone    = isset($row['phone']) ? $row['phone'] : null;
            $this->password = $row['password'];
            $this->role     = $row['role'];
            $this->status   = $row['status'];
            return true;
        }
        return false;
    }

    public function getAllCustomers() {
        $query = "SELECT u.id, u.name, u.email, u.status, u.created_at,
                  COUNT(o.id) as orders, COALESCE(SUM(o.final_total), 0) as spent
                  FROM " . $this->table_name . " u
                  LEFT JOIN orders o ON u.id = o.user_id
                  WHERE u.role = 'Customer'
                  GROUP BY u.id
                  ORDER BY u.created_at DESC";
        $result = $this->conn->query($query);
        return $result;
    }
}
?>
