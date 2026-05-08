<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
if ($user_id <= 0) { http_response_code(400); exit(); }

$database = new Database();
$db = $database->getConnection();

$query = "SELECT s.id, s.product_id, s.quantity, s.frequency, s.next_delivery_date, s.status, p.name as product_name, p.image_path as product_image, p.price 
          FROM subscriptions s 
          JOIN products p ON s.product_id = p.id 
          WHERE s.user_id = ? ORDER BY s.created_at DESC";
$stmt = $db->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res = $stmt->get_result();

$subs = [];
while ($row = $res->fetch_assoc()) {
    $base_url = "http://" . $_SERVER['HTTP_HOST'] . "/grocery-backend";
    $row['product_image'] = strpos($row['product_image'], 'http') === 0 ? $row['product_image'] : $base_url . $row['product_image'];
    $subs[] = $row;
}
echo json_encode(["records" => $subs]);
?>
