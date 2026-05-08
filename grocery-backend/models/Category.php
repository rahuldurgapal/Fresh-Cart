<?php
class Category {
    private $conn;
    private $table_name = "categories";

    public $id;
    public $name;
    public $status;
    public $image_path;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Read all categories
    public function readAll() {
        $query = "SELECT c.*, COUNT(p.id) as count 
                  FROM " . $this->table_name . " c 
                  LEFT JOIN products p ON c.id = p.category_id 
                  GROUP BY c.id 
                  ORDER BY c.created_at DESC";
        $result = $this->conn->query($query);
        return $result;
    }

    // Create a new category
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " (name, status, image_path) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        $name   = strip_tags($this->name);
        $status = strip_tags($this->status);

        $stmt->bind_param("sss", $name, $status, $this->image_path);

        if ($stmt->execute()) { return true; }
        return false;
    }

    // Update a category
    public function update() {
        if (!empty($this->image_path)) {
            $query = "UPDATE " . $this->table_name . " SET name=?, status=?, image_path=? WHERE id=?";
            $stmt = $this->conn->prepare($query);

            $name   = strip_tags($this->name);
            $status = strip_tags($this->status);

            $stmt->bind_param("sssi", $name, $status, $this->image_path, $this->id);
        } else {
            $query = "UPDATE " . $this->table_name . " SET name=?, status=? WHERE id=?";
            $stmt = $this->conn->prepare($query);

            $name   = strip_tags($this->name);
            $status = strip_tags($this->status);

            $stmt->bind_param("ssi", $name, $status, $this->id);
        }

        if ($stmt->execute()) { return true; }
        return false;
    }

    // Delete a category
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $this->id);
        if ($stmt->execute()) { return true; }
        return false;
    }
}
?>
