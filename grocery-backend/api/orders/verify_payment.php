<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';

$keySecret = '7hxz2TwDOv3aLoRDK1eamxKe';

$data = json_decode(file_get_contents("php://input"));

if (empty($data->razorpay_order_id) || empty($data->razorpay_payment_id) || empty($data->razorpay_signature) || empty($data->order_id)) {
    http_response_code(400);
    echo json_encode(["message" => "Missing payment parameters"]);
    exit;
}

$generated_signature = hash_hmac('sha256', $data->razorpay_order_id . "|" . $data->razorpay_payment_id, $keySecret);

if ($generated_signature === $data->razorpay_signature) {
    // Payment is successful! Update order payment_status to 'Paid'
    $database = new Database();
    $db = $database->getConnection();
    
    // We already inserted payment_method as 'Online' and payment_status as 'Pending' in place_order.php.
    $query = "UPDATE orders SET payment_status = 'Success', transaction_id = ? WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->bind_param("si", $data->razorpay_payment_id, $data->order_id);
    
    if($stmt->execute()) {
        http_response_code(200);
        echo json_encode(["message" => "Payment verified successfully", "status" => "success"]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Payment verified, but Database update failed", "status" => "error"]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Security verification failed! Invalid signature.", "status" => "error"]);
}
?>
