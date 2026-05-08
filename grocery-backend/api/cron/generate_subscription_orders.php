<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/Order.php';

// In production, secure this endpoint with a cron secret key
$secret = isset($_GET['secret']) ? $_GET['secret'] : '';
if ($secret !== 'cron_secure_123') {
    http_response_code(403);
    echo json_encode(["message" => "Unauthorized access."]);
    exit();
}

$database = new Database();
$db = $database->getConnection();
$today = date('Y-m-d');

// Find all active subscriptions due today or earlier
$query = "SELECT s.id as sub_id, s.user_id, s.product_id, s.quantity, s.frequency, p.price, p.name 
          FROM subscriptions s 
          JOIN products p ON s.product_id = p.id 
          WHERE s.status = 'Active' AND s.next_delivery_date <= ?";
$stmt = $db->prepare($query);
$stmt->bind_param("s", $today);
$stmt->execute();
$res = $stmt->get_result();

$generated_count = 0;

while ($sub = $res->fetch_assoc()) {
    $order = new Order($db);
    $order->user_id = $sub['user_id'];
    $order->delivery_address = "Subscription Address"; // In real app, fetch default address
    $order->payment_method = "Wallet"; // Assume Wallet or COD
    $order->payment_status = "Pending";
    $order->transaction_id = "SUB-" . time() . rand(1000, 9999);
    $order->final_total = $sub['price'] * $sub['quantity'];
    
    $cart = [
        [
            "id" => $sub['product_id'],
            "price" => $sub['price'],
            "quantity" => $sub['quantity'],
            "title" => $sub['name']
        ]
    ];
    
    if ($order->createWithItems($cart)) {
        // Update next_delivery_date
        $next_date = date('Y-m-d', strtotime('+1 day'));
        if ($sub['frequency'] === 'Weekly') {
            $next_date = date('Y-m-d', strtotime('+1 week'));
        }
        $up_stmt = $db->prepare("UPDATE subscriptions SET next_delivery_date = ? WHERE id = ?");
        $up_stmt->bind_param("si", $next_date, $sub['sub_id']);
        $up_stmt->execute();
        
        $generated_count++;
    }
}

echo json_encode(["message" => "Cron executed successfully.", "orders_generated" => $generated_count]);
?>
