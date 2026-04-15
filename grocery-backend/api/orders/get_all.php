<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/Order.php';

$database = new Database();
$db       = $database->getConnection();
$order    = new Order($db);

$result   = $order->readAllFullDetails();
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
