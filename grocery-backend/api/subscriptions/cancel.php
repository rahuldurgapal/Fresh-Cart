<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
$data = json_decode(file_get_contents("php://input"));

if (empty($data->id)) { http_response_code(400); exit(); }

$database = new Database();
$db = $database->getConnection();

$stmt = $db->prepare("UPDATE subscriptions SET status = 'Cancelled' WHERE id = ?");
$stmt->bind_param("i", $data->id);

if ($stmt->execute()) {
    echo json_encode(["message" => "Subscription cancelled."]);
} else {
    http_response_code(503);
    echo json_encode(["message" => "Failed to cancel."]);
}
?>
