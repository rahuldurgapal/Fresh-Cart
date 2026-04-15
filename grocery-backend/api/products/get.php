<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/Product.php';

$database = new Database();
$db       = $database->getConnection();
$product  = new Product($db);

$result   = $product->readAll();
$rowCount = $result->num_rows;

if ($rowCount > 0) {
    $products_arr = array("records" => array());
    while ($row = $result->fetch_assoc()) {
        array_push($products_arr["records"], $row);
    }
    http_response_code(200);
    echo json_encode($products_arr);
} else {
    http_response_code(200);
    echo json_encode(array("records" => []));
}
?>
