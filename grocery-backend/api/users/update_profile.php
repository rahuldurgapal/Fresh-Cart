<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/User.php';

$database = new Database();
$db       = $database->getConnection();
$user     = new User($db);

$data = json_decode(file_get_contents("php://input"));

require_once '../../config/JWT.php';
$token = JWT::getBearerToken();
$payload = JWT::decode($token, $database->getJWTSecret());

if (!$payload || $payload['id'] != ($data->id ?? 0)) {
    http_response_code(401);
    echo json_encode(array("message" => "Unauthorized: Please log in again."));
    exit;
}

if (!empty($data->id) && !empty($data->name)) {
    $user->id    = $data->id;
    $user->name  = $data->name;
    $user->phone = isset($data->phone) ? $data->phone : null;

    if ($user->updateProfile()) {
        http_response_code(200);
        echo json_encode(array("message" => "Profile updated successfully."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to update profile."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data."));
}
?>
