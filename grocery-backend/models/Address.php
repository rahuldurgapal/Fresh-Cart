<?php
class Address {
    private $conn;
    public $id;
    public $user_id;
    public $street_address;
    public $city;
    public $zip_code;
    public $phone_number;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO addresses (user_id, street_address, city, zip_code, phone_number) VALUES (?, ?, ?, ?, ?)";
        $stmt  = $this->conn->prepare($query);

        $stmt->bind_param("issss",
            $this->user_id, $this->street_address,
            $this->city, $this->zip_code, $this->phone_number
        );

        if ($stmt->execute()) {
            $this->id = $this->conn->insert_id;
            return true;
        }
        return false;
    }

    public function update() {
        $query = "UPDATE addresses SET street_address = ?, city = ?, zip_code = ?, phone_number = ? WHERE id = ? AND user_id = ?";
        $stmt  = $this->conn->prepare($query);
        $stmt->bind_param("ssssii", 
            $this->street_address, $this->city, 
            $this->zip_code, $this->phone_number, 
            $this->id, $this->user_id
        );

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    public function getByUserId($userId) {
        $query = "SELECT * FROM addresses WHERE user_id = ? LIMIT 1";
        $stmt  = $this->conn->prepare($query);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $this->id = $row['id'];
            $this->user_id = $row['user_id'];
            $this->street_address = $row['street_address'];
            $this->city = $row['city'];
            $this->zip_code = $row['zip_code'];
            $this->phone_number = $row['phone_number'];
            return true;
        }
        return false;
    }

    public function getAllByUserId($userId) {
        $query = "SELECT * FROM addresses WHERE user_id = ? ORDER BY id DESC";
        $stmt  = $this->conn->prepare($query);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result;
    }
}
?>
