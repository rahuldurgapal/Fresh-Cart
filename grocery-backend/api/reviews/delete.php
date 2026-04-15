<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';

$database = new Database();
$db       = $database->getConnection();

$id = null;
if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
} else {
    $data = json_decode(file_get_contents("php://input"));
    if (isset($data->id)) $id = intval($data->id);
}

if (!empty($id)) {
    $stmt = $db->prepare("DELETE FROM reviews WHERE id = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(array("message" => "Review deleted."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to delete review."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Review ID required."));
}
?>
