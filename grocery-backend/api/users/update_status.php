<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../config/JWT.php';

$database = new Database();
$db       = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

// JWT Protection
$token = JWT::getBearerToken();
$payload = JWT::decode($token, $database->getJWTSecret());

if (!$payload || $payload['role'] !== 'Admin') {
    http_response_code(401);
    echo json_encode(array("message" => "Unauthorized access."));
    exit;
}

if (!empty($data->id) && isset($data->status)) {
    $status = htmlspecialchars(strip_tags($data->status));
    $id     = intval($data->id);

    $stmt = $db->prepare("UPDATE customers SET status=? WHERE id=?");
    $stmt->bind_param("si", $status, $id);

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(array("message" => "User status updated."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to update user status."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "User ID and status required."));
}
?>
