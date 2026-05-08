<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

$data = json_decode(file_get_contents("php://input"));

if (empty($data->user_id) || empty($data->product_id) || empty($data->frequency)) {
    http_response_code(400);
    echo json_encode(["message" => "Missing required fields."]);
    exit();
}

$database = new Database();
$db = $database->getConnection();

$next_date = date('Y-m-d', strtotime('+1 day'));

$query = "INSERT INTO subscriptions (user_id, product_id, quantity, frequency, next_delivery_date, status) VALUES (?, ?, ?, ?, ?, 'Active')";
$stmt = $db->prepare($query);
$qty = isset($data->quantity) ? intval($data->quantity) : 1;
$stmt->bind_param("iiiss", $data->user_id, $data->product_id, $qty, $data->frequency, $next_date);

if ($stmt->execute()) {
    http_response_code(201);
    echo json_encode(["message" => "Subscription created successfully."]);
} else {
    http_response_code(503);
    echo json_encode(["message" => "Failed to create subscription."]);
}
?>
