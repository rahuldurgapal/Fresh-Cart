<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../config/JWT.php';
require_once '../../config/NotificationHelper.php';

$database = new Database();
$db       = $database->getConnection();

$token   = JWT::getBearerToken();
$payload = JWT::decode($token, $database->getJWTSecret());

if (!$payload || $payload['role'] !== 'Delivery Agent') {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized."]);
    exit;
}

$data     = json_decode(file_get_contents("php://input"));
$order_id = intval($data->order_id ?? 0);
$agent_id = $payload['id'];

if (!$order_id) {
    http_response_code(400);
    echo json_encode(["message" => "order_id is required."]);
    exit;
}

// Check order is still unassigned and in Processing state
$check = $db->prepare("SELECT id FROM orders WHERE id = ? AND delivery_agent_id IS NULL AND status = 'Processing'");
$check->bind_param("i", $order_id);
$check->execute();
if ($check->get_result()->num_rows === 0) {
    http_response_code(409);
    echo json_encode(["message" => "Order is no longer available. Another agent may have accepted it."]);
    exit;
}

// Assign the agent and set status to Out for Delivery
$stmt = $db->prepare("UPDATE orders SET delivery_agent_id = ?, status = 'Out for Delivery' WHERE id = ?");
$stmt->bind_param("ii", $agent_id, $order_id);

if ($stmt->execute()) {
    // Notify admin that an agent accepted the order
    $agent_name = $payload['name'] ?? 'A Delivery Agent';
    NotificationHelper::onOrderAccepted($db, $order_id, $agent_name);

    http_response_code(200);
    echo json_encode(["message" => "Order accepted! Head to customer now.", "order_id" => $order_id]);
} else {
    http_response_code(503);
    echo json_encode(["message" => "Failed to accept order. Try again."]);
}
?>
