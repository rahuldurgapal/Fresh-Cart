<?php
class Coupon {
    private $conn;
    private $table_name = "coupons";

    public $id;
    public $code;
    public $discount_type;
    public $discount_value;
    public $min_order;
    public $status;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function readAll() {
        $query  = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
        $result = $this->conn->query($query);
        return $result;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " (code, discount_type, discount_value, min_order, status) VALUES (?, ?, ?, ?, ?)";
        $stmt  = $this->conn->prepare($query);

        $code = htmlspecialchars(strip_tags($this->code));

        $stmt->bind_param("ssdds", $code, $this->discount_type, $this->discount_value, $this->min_order, $this->status);

        if ($stmt->execute()) { return true; }
        return false;
    }

    public function update() {
        $query = "UPDATE " . $this->table_name . " SET code=?, discount_type=?, discount_value=?, min_order=?, status=? WHERE id=?";
        $stmt  = $this->conn->prepare($query);

        $code = htmlspecialchars(strip_tags($this->code));

        $stmt->bind_param("ssddsi", $code, $this->discount_type, $this->discount_value, $this->min_order, $this->status, $this->id);

        if ($stmt->execute()) { return true; }
        return false;
    }

    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt  = $this->conn->prepare($query);
        $stmt->bind_param("i", $this->id);
        if ($stmt->execute()) { return true; }
        return false;
    }

    public function validateCoupon($code) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE code = ? AND status = 'Active' LIMIT 1";
        $stmt  = $this->conn->prepare($query);
        $stmt->bind_param("s", $code);
        $stmt->execute();
        return $stmt->get_result();
    }
}
?>
