<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/Order.php';
require_once '../../models/Address.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

// Add JWT Protection
require_once '../../config/JWT.php';
$token = JWT::getBearerToken();
$payload = JWT::decode($token, $database->getJWTSecret());

if (!$payload || $payload['id'] != ($data->user_id ?? 0)) {
    http_response_code(401);
    echo json_encode(array("message" => "Unauthorized: Session expired or invalid."));
    exit;
}

// Detailed Validation
if (empty($data->user_id)) {
    http_response_code(400);
    echo json_encode(array("message" => "Order failed: User ID is missing."));
    exit;
}
if (empty($data->cart) || !is_array($data->cart)) {
    http_response_code(400);
    echo json_encode(array("message" => "Order failed: Cart is empty or invalid."));
    exit;
}
if (empty($data->address_id) && (empty($data->address) || empty($data->address->houseNo))) {
    http_response_code(400);
    echo json_encode(array("message" => "Order failed: Incomplete delivery address."));
    exit;
}

// Proceed with Order Placement
if(true) { // Already validated above
    
    if (!empty($data->address_id)) {
        $final_address_id = intval($data->address_id);
    } else {
        // Save address first
        $addr = new Address($db);
        $addr->user_id = $data->user_id;
        $addr->street_address = $data->address->houseNo . ", " . $data->address->area;
        $addr->city = !empty($data->address->city) ? $data->address->city : 'Online Order';
        $addr->zip_code = !empty($data->address->zip) ? $data->address->zip : '000000';
        $addr->phone_number = $data->phone ?? '0000000000';
        
        if(!$addr->create()) {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to save delivery address."));
            exit;
        }
        $final_address_id = $addr->id;
    }

    // Now save Order with items
    $order = new Order($db);
    $order->user_id = $data->user_id;
    $order->address_id = $final_address_id;
    $order->coupon_code = isset($data->coupon) ? $data->coupon : null;
    
    // Map frontend payment methods to Backend Enum: enum('COD','Online')
    $pm = strtolower($data->payment_method ?? 'cod');
    if ($pm === 'cod') {
        $order->payment_method = 'COD';
    } else {
        $order->payment_method = 'Online';
    }
    
    $order->payment_status = 'Pending';
    $order->final_total = $data->final_total ?? 0;

    if($order->createWithItems($data->cart)) {
        http_response_code(201);
        echo json_encode(array("message" => "Order placed successfully!", "order_id" => $order->id));
    } else {
        http_response_code(503);
        $msg = "Order processing failed.";
        if (!empty($order->error_message)) {
            $msg .= " " . $order->error_message;
        } else {
            $msg .= " (Database error)";
        }
        echo json_encode(array("message" => $msg));
    }
}
?>
