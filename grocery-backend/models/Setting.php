<?php
class Setting {
    private $conn;
    private $table_name = "settings";

    public $id = 1;
    public $store_name;
    public $support_email;
    public $support_phone;
    public $currency;
    public $delivery_fee;
    public $free_delivery_threshold;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Read settings (always ID=1)
    public function get() {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = 1 LIMIT 1";
        $result = $this->conn->query($query);
        return $result->fetch_assoc();
    }

    // Update settings
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET store_name=?, support_email=?, support_phone=?, currency=?, 
                      delivery_fee=?, free_delivery_threshold=? 
                  WHERE id = 1";
        
        $stmt = $this->conn->prepare($query);

        $name   = htmlspecialchars(strip_tags($this->store_name));
        $email  = htmlspecialchars(strip_tags($this->support_email));
        $phone  = htmlspecialchars(strip_tags($this->support_phone));
        $curr   = htmlspecialchars(strip_tags($this->currency));

        $stmt->bind_param("ssssdd", 
            $name, $email, $phone, $curr, 
            $this->delivery_fee, $this->free_delivery_threshold
        );

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }
}
?>
