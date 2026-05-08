<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../config/JWT.php';

$database = new Database();
$db       = $database->getConnection();

$token   = JWT::getBearerToken();
$payload = JWT::decode($token, $database->getJWTSecret());

if (!$payload || $payload['role'] !== 'Delivery Agent') {
    http_response_code(401);
    echo json_encode(["valid" => false, "message" => "Invalid or expired token."]);
    exit;
}

// Fetch fresh data from DB to confirm agent still exists and is active
$stmt = $db->prepare("SELECT id, name, email, phone, role, status FROM staff WHERE id = ? AND role = 'Delivery Agent' AND status = 'Active'");
$stmt->bind_param("i", $payload['id']);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(["valid" => false, "message" => "Agent account not found or deactivated."]);
    exit;
}

$agent = $result->fetch_assoc();
http_response_code(200);
echo json_encode(["valid" => true, "agent" => $agent]);
?>
