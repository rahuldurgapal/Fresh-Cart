<?php
class Product {
    private $conn;
    private $table_name = "products";

    public $id;
    public $name;
    public $description;
    public $storage_tips;
    public $shelf_life;
    public $product_type;
    public $category_id;
    public $price;
    public $stock;
    public $unit;
    public $status;
    public $image_path;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Read all products with category name
    public function readAll() {
        $query = "SELECT p.*, c.name as category_name 
                  FROM " . $this->table_name . " p 
                  LEFT JOIN categories c ON p.category_id = c.id 
                  ORDER BY p.created_at DESC";
        $result = $this->conn->query($query);
        return $result;
    }

    // Create a new product
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  (name, description, storage_tips, shelf_life, product_type, category_id, price, stock, unit, status, image_path) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);

        $name        = htmlspecialchars(strip_tags($this->name));
        $description = htmlspecialchars(strip_tags($this->description ?? ''));
        $storage     = htmlspecialchars(strip_tags($this->storage_tips ?? ''));
        $shelf       = htmlspecialchars(strip_tags($this->shelf_life ?? ''));
        $ptype       = htmlspecialchars(strip_tags($this->product_type ?? ''));

        $unit        = htmlspecialchars(strip_tags($this->unit ?? '1 unit'));

        $stmt->bind_param("sssssisssss",
            $name, $description, $storage, $shelf, $ptype,
            $this->category_id, $this->price, $this->stock, $unit,
            $this->status, $this->image_path
        );

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Update a product
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET name=?, description=?, storage_tips=?, shelf_life=?, product_type=?, 
                      category_id=?, price=?, stock=?, unit=?, status=? 
                  WHERE id=?";
        $stmt = $this->conn->prepare($query);

        $name        = htmlspecialchars(strip_tags($this->name));
        $description = htmlspecialchars(strip_tags($this->description ?? ''));
        $storage     = htmlspecialchars(strip_tags($this->storage_tips ?? ''));
        $shelf       = htmlspecialchars(strip_tags($this->shelf_life ?? ''));
        $ptype       = htmlspecialchars(strip_tags($this->product_type ?? ''));

        $unit        = htmlspecialchars(strip_tags($this->unit ?? '1 unit'));

        $stmt->bind_param("sssssissssi",
            $name, $description, $storage, $shelf, $ptype,
            $this->category_id, $this->price, $this->stock, $unit,
            $this->status, $this->id
        );

        if ($stmt->execute()) { return true; }
        return false;
    }

    // Delete a product
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->bind_param("i", $this->id);
        if ($stmt->execute()) { return true; }
        return false;
    }
}
?>
