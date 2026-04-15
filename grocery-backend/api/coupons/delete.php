<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/Coupon.php';

$database = new Database();
$db       = $database->getConnection();
$coupon   = new Coupon($db);

$id = null;
if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
} else {
    $data = json_decode(file_get_contents("php://input"));
    if (isset($data->id)) $id = intval($data->id);
}

if (!empty($id)) {
    $coupon->id = $id;
    if ($coupon->delete()) {
        http_response_code(200);
        echo json_encode(array("message" => "Coupon deleted successfully."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to delete coupon."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Coupon ID is required."));
}
?>
