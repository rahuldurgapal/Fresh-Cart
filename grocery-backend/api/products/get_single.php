<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';

$database = new Database();
$db       = $database->getConnection();

$id = isset($_GET['id']) ? intval($_GET['id']) : null;

if (empty($id)) {
    http_response_code(400);
    echo json_encode(array("message" => "No ID provided."));
    exit;
}

$query = "SELECT p.*, c.name as category_name 
          FROM products p 
          LEFT JOIN categories c ON p.category_id = c.id 
          WHERE p.id = ? LIMIT 1";

$stmt = $db->prepare($query);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    http_response_code(200);
    echo json_encode($row);
} else {
    http_response_code(404);
    echo json_encode(array("message" => "Product does not exist."));
}
?>
