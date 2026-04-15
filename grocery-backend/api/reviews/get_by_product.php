<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/Review.php';

$database = new Database();
$db       = $database->getConnection();
$review   = new Review($db);

$review->product_id = isset($_GET['product_id']) ? intval($_GET['product_id']) : null;

if (empty($review->product_id)) {
    http_response_code(400);
    echo json_encode(array("message" => "No product ID provided."));
    exit;
}

$result = $review->readByProduct();
$arr    = array("records" => array());

while ($row = $result->fetch_assoc()) {
    array_push($arr["records"], $row);
}

http_response_code(200);
echo json_encode($arr);
?>
