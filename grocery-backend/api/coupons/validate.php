<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/Coupon.php';

$database = new Database();
$db       = $database->getConnection();
$coupon   = new Coupon($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->code) && isset($data->cart_total)) {
    $code       = strtoupper(trim($data->code));
    $cart_total = (float)$data->cart_total;

    $result = $coupon->validateCoupon($code);

    if ($result->num_rows > 0) {
        $row       = $result->fetch_assoc();
        $min_order = (float)$row['min_order'];

        if ($cart_total >= $min_order) {
            http_response_code(200);
            echo json_encode(array(
                "status"  => "success",
                "message" => "Coupon applied successfully!",
                "coupon"  => array(
                    "code"           => $row['code'],
                    "discount_type"  => $row['discount_type'],
                    "discount_value" => (float)$row['discount_value']
                )
            ));
        } else {
            http_response_code(400);
            echo json_encode(array("status" => "error", "message" => "Minimum order value of ₹{$min_order} required for this coupon."));
        }
    } else {
        http_response_code(404);
        echo json_encode(array("status" => "error", "message" => "Invalid or expired promo code."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Code or cart total missing."));
}
?>
