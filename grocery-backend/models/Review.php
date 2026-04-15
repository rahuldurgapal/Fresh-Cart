<?php
class Review {
    private $conn;
    private $table_name = "reviews";

    public $id;
    public $product_id;
    public $user_name;
    public $rating;
    public $comment;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function readByProduct() {
        $query  = "SELECT * FROM " . $this->table_name . " WHERE product_id = ? ORDER BY created_at DESC";
        $stmt   = $this->conn->prepare($query);
        $stmt->bind_param("i", $this->product_id);
        $stmt->execute();
        return $stmt->get_result();
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . " (product_id, user_name, rating, comment) VALUES (?, ?, ?, ?)";
        $stmt  = $this->conn->prepare($query);
        $name  = htmlspecialchars(strip_tags($this->user_name));
        $cmnt  = htmlspecialchars(strip_tags($this->comment));
        $stmt->bind_param("isis", $this->product_id, $name, $this->rating, $cmnt);
        if ($stmt->execute()) { return true; }
        return false;
    }
}
?>
