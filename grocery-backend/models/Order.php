<?php
class Order {
    private $conn;
    public $id;
    public $user_id;
    public $address_id;
    public $coupon_code;
    public $payment_method;
    public $payment_status;
    public $final_total;
    public $error_message;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function createWithItems($cart_items) {
        // Enable detailed error reporting
        mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
        
        // Begin Transaction
        $this->conn->begin_transaction();

        try {
            // 1. Insert Order
            $query = "INSERT INTO orders (user_id, address_id, coupon_code, payment_method, payment_status, final_total) 
                      VALUES (?, ?, ?, ?, ?, ?)";
            $stmt  = $this->conn->prepare($query);
            $stmt->bind_param("iisssd",
                $this->user_id, $this->address_id, $this->coupon_code,
                $this->payment_method, $this->payment_status, $this->final_total
            );
            $stmt->execute();
            $this->id = $this->conn->insert_id;

            // 2. Insert Order Items
            $item_query = "INSERT INTO order_items (order_id, product_id, quantity, unit_price, unit) VALUES (?, ?, ?, ?, ?)";
            $item_stmt  = $this->conn->prepare($item_query);

            // 3. Stock deduction query
            $stock_query = "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?";
            $stock_stmt  = $this->conn->prepare($stock_query);

            foreach ($cart_items as $item) {
                $price = (float)$item->price;
                $qty   = (int)$item->quantity;
                $pid   = (int)$item->id;

                $item_unit = isset($item->unit) ? $item->unit : '1 unit';
                $item_stmt->bind_param("iiids", $this->id, $pid, $qty, $price, $item_unit);
                $item_stmt->execute();

                $stock_stmt->bind_param("iii", $qty, $pid, $qty);
                $stock_stmt->execute();
                
                // CRITICAL: Check if stock was actually deducted
                if ($this->conn->affected_rows === 0) {
                    throw new Exception("Product ID $pid is out of stock or insufficient quantity!");
                }
            }

            $this->conn->commit();
            return true;

        } catch (Exception $e) {
            $this->conn->rollback();
            // Provide the actual error message back to the API
            $this->error_message = $e->getMessage();
            return false;
        }
    }

    public function readAllFullDetails() {
        $query  = "SELECT o.*, u.name as customer_name, a.city, a.street_address,
                   (SELECT SUM(quantity) FROM order_items WHERE order_id = o.id) as total_items
                   FROM orders o
                   JOIN users u ON o.user_id = u.id
                   JOIN addresses a ON o.address_id = a.id
                   ORDER BY o.created_at DESC";
        $result = $this->conn->query($query);
        return $result;
    }
}
?>
