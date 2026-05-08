<?php
class Customer {
    private $conn;
    private $table_name = "customers";

    public $id;
    public $name;
    public $phone;
    public $wallet_balance;
    public $referral_code;
    public $referred_by;
    public $status;
    public $is_verified;
    public $verification_code;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function register() {
        if ($this->phoneExists()) {
            return false;
        }

        if (empty($this->referral_code)) {
            $this->referral_code = strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));
        }

        $query = "INSERT INTO " . $this->table_name . " (name, phone, status, is_verified, verification_code, referral_code, referred_by) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt  = $this->conn->prepare($query);

        $v = 0; // is_verified
        $stmt->bind_param("sssisss", $this->name, $this->phone, $this->status, $v, $this->verification_code, $this->referral_code, $this->referred_by);

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

    public function phoneExists() {
        $query = "SELECT id, name, phone, status, is_verified, verification_code, wallet_balance, referral_code FROM " . $this->table_name . " WHERE phone = ? LIMIT 1";
        $stmt  = $this->conn->prepare($query);
        $stmt->bind_param("s", $this->phone);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $this->id       = $row['id'];
            $this->name     = $row['name'];
            $this->phone    = $row['phone'];
            $this->status   = $row['status'];
            $this->is_verified = $row['is_verified'];
            $this->verification_code = $row['verification_code'];
            $this->wallet_balance = $row['wallet_balance'];
            $this->referral_code = $row['referral_code'];
            return true;
        }
        return false;
    }

    public function verifyAccount() {
        $query = "UPDATE " . $this->table_name . " SET is_verified = 1, verification_code = NULL WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $this->id);
        return $stmt->execute();
    }

    public function setVerificationCode($code) {
        $query = "UPDATE " . $this->table_name . " SET verification_code = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("si", $code, $this->id);
        return $stmt->execute();
    }

    public function getAllCustomers() {
        $query = "SELECT c.id, c.name, c.phone, c.status, c.created_at,
                  COUNT(o.id) as orders, COALESCE(SUM(o.final_total), 0) as spent
                  FROM " . $this->table_name . " c
                  LEFT JOIN orders o ON c.id = o.user_id
                  GROUP BY c.id
                  ORDER BY c.created_at DESC";
        $result = $this->conn->query($query);
        return $result;
    }
    
    public function getIdByReferralCode($code) {
        $query = "SELECT id FROM " . $this->table_name . " WHERE referral_code = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("s", $code);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            return $result->fetch_assoc()['id'];
        }
        return null;
    }
}
?>
