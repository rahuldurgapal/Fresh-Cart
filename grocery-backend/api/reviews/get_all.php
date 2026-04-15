<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';

$database = new Database();
$db       = $database->getConnection();

// Get all reviews with product name
$query  = "SELECT r.*, p.name as product_name FROM reviews r LEFT JOIN products p ON r.product_id = p.id ORDER BY r.created_at DESC";
$result = $db->query($query);

$arr = array("records" => array());
while ($row = $result->fetch_assoc()) {
    array_push($arr["records"], $row);
}

http_response_code(200);
echo json_encode($arr);
?>
