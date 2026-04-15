<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/Coupon.php';

$database = new Database();
$db       = $database->getConnection();
$coupon   = new Coupon($db);

$result   = $coupon->readAll();
$rowCount = $result->num_rows;

if ($rowCount > 0) {
    $arr = array("records" => array());
    while ($row = $result->fetch_assoc()) {
        array_push($arr["records"], $row);
    }
    http_response_code(200);
    echo json_encode($arr);
} else {
    http_response_code(200);
    echo json_encode(array("records" => []));
}
?>
