<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';

$database = new Database();
$db       = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

// Add JWT Protection
require_once '../../config/JWT.php';
$token = JWT::getBearerToken();
$payload = JWT::decode($token, $database->getJWTSecret());

if (!$payload) {
    http_response_code(401);
    echo json_encode(array("message" => "Unauthorized access."));
    exit;
}

if (!empty($data->id)) {
    $id = intval($data->id);

    // Ensure the address belongs to the user
    $check = $db->prepare("SELECT id FROM addresses WHERE id=? AND user_id=?");
    $check->bind_param("ii", $id, $payload['id']);
    $check->execute();
    if ($check->get_result()->num_rows === 0) {
        http_response_code(403);
        echo json_encode(array("message" => "Forbidden."));
        exit;
    }

    $stmt = $db->prepare("DELETE FROM addresses WHERE id=?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(array("message" => "Address deleted successfully."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to delete address."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Address ID required."));
}
?>
