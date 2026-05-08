<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($user_id <= 0) {
    http_response_code(400);
    echo json_encode(["message" => "Valid user_id is required."]);
    exit();
}

$database = new Database();
$db = $database->getConnection();

$query = "SELECT id, name, phone, status, created_at, referral_code, wallet_balance FROM customers WHERE id = ? LIMIT 1";
$stmt = $db->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    http_response_code(200);
    echo json_encode($user);
} else {
    http_response_code(404);
    echo json_encode(["message" => "User not found."]);
}
?>
