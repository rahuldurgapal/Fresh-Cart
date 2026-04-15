<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/Coupon.php';

$database = new Database();
$db       = $database->getConnection();
$coupon   = new Coupon($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->code) && !empty($data->discount_type) && isset($data->discount_value)) {
    $coupon->code           = strtoupper(trim($data->code));
    $coupon->discount_type  = $data->discount_type;
    $coupon->discount_value = (float)$data->discount_value;
    $coupon->min_order      = isset($data->min_order) ? (float)$data->min_order : 0;
    $coupon->status         = isset($data->status) ? $data->status : 'Active';

    if ($coupon->create()) {
        http_response_code(201);
        echo json_encode(array("message" => "Coupon was created."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to create coupon."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data."));
}
?>
