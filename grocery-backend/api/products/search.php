<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';

$database = new Database();
$db       = $database->getConnection();

$q = isset($_GET['q']) ? '%' . htmlspecialchars(trim($_GET['q'])) . '%' : null;

if (empty($q)) {
    http_response_code(400);
    echo json_encode(array("message" => "Search query required."));
    exit;
}

$stmt = $db->prepare("SELECT p.*, c.name as category_name 
                       FROM products p 
                       LEFT JOIN categories c ON p.category_id = c.id 
                       WHERE p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?
                       ORDER BY p.name ASC LIMIT 20");
$stmt->bind_param("sss", $q, $q, $q);
$stmt->execute();
$result = $stmt->get_result();

$arr = array("records" => array());
while ($row = $result->fetch_assoc()) {
    array_push($arr["records"], $row);
}

http_response_code(200);
echo json_encode($arr);
?>
