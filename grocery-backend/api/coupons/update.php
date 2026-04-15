<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/Coupon.php';

$database = new Database();
$db       = $database->getConnection();
$coupon   = new Coupon($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id)) {
    $coupon->id             = $data->id;
    $coupon->code           = strtoupper(trim($data->code));
    $coupon->discount_type  = $data->discount_type;
    $coupon->discount_value = (float)$data->discount_value;
    $coupon->min_order      = isset($data->min_order) ? (float)$data->min_order : 0;
    $coupon->status         = isset($data->status) ? $data->status : 'Active';

    if ($coupon->update()) {
        http_response_code(200);
        echo json_encode(array("message" => "Coupon updated successfully."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to update coupon."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data."));
}
?>
