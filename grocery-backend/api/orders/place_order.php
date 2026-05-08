<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/Order.php';
require_once '../../models/Address.php';
require_once '../../config/NotificationHelper.php';

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
if (empty($data->address_id)) {
    if (empty($data->address)) {
        http_response_code(400);
        echo json_encode(array("message" => "Order failed: Delivery address is missing."));
        exit;
    }
    if (empty($data->address->houseNo)) {
        http_response_code(400);
        echo json_encode(array("message" => "Order failed: House/Flat number is required."));
        exit;
    }
    if (empty($data->address->area)) {
        http_response_code(400);
        echo json_encode(array("message" => "Order failed: Apartment/Area is required."));
        exit;
    }
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
        $addr->delivery_phone = $data->phone ?? '0000000000';
        
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
        $order->transaction_id = 'TXN-COD-' . time() . rand(1000, 9999);
    } else {
        $order->payment_method = 'Online';
        $order->transaction_id = null;
    }
    
    $order->payment_status = 'Pending';
    $order->final_total = $data->final_total ?? 0;

    // Check if this is the user's first order
    $is_first_order = false;
    $chk_stmt = $db->prepare("SELECT COUNT(*) as c FROM orders WHERE user_id = ?");
    $chk_stmt->bind_param("i", $payload['id']);
    $chk_stmt->execute();
    $chk_res = $chk_stmt->get_result()->fetch_assoc();
    if ($chk_res['c'] == 0) {
        $is_first_order = true;
    }

    if($order->createWithItems($data->cart)) {
        
        // --- TRIGGER NOTIFICATIONS ---
        $u_name = isset($payload['name']) ? $payload['name'] : 'Customer';
        NotificationHelper::onNewOrder($db, $order->id, $u_name, $order->final_total);

        // --- REFERRAL REWARD (₹50) ---
        if ($is_first_order) {
            $ref_stmt = $db->prepare("SELECT referred_by FROM customers WHERE id = ?");
            $ref_stmt->bind_param("i", $payload['id']);
            $ref_stmt->execute();
            $ref_res = $ref_stmt->get_result()->fetch_assoc();
            if (!empty($ref_res['referred_by'])) {
                // Credit ₹50 to referrer
                $db->query("UPDATE customers SET wallet_balance = wallet_balance + 50 WHERE id = " . $ref_res['referred_by']);
                // Credit ₹50 to referee
                $db->query("UPDATE customers SET wallet_balance = wallet_balance + 50 WHERE id = " . $payload['id']);
                
                // Note: The WalletContext frontend will auto-fetch this updated balance if we build a get_profile API.
            }
        }

        // --- TRIGGER EMAIL NOTIFICATION (Mocked for testing) ---
        require_once '../Mailer.php';
        $u_email = isset($payload['email']) ? $payload['email'] : 'customer@example.com';
        Mailer::sendOrderConfirmation($u_email, $u_name, $order->id, $order->final_total);

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
