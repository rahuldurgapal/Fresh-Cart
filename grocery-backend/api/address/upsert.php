<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/Address.php';

$database = new Database();
$db       = $database->getConnection();
$address  = new Address($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->user_id)) {
    // Add JWT Protection
    require_once '../../config/JWT.php';
    $token = JWT::getBearerToken();
    $payload = JWT::decode($token, $database->getJWTSecret());

    if (!$payload || $payload['id'] != $data->user_id) {
        http_response_code(401);
        echo json_encode(array("message" => "Unauthorized access."));
        exit;
    }

    $address->user_id        = $data->user_id;
    $address->street_address = $data->street_address;
    $address->city           = $data->city;
    $address->zip_code       = $data->zip_code;
    $address->phone_number   = $data->phone_number;

    // Check if ID is provided for update
    if (!empty($data->id)) {
        $address->id = intval($data->id);
        if ($address->update()) {
            http_response_code(200);
            echo json_encode(array("message" => "Address updated successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to update address."));
        }
    } else {
        if ($address->create()) {
            http_response_code(201);
            echo json_encode(array("message" => "Address created successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Unable to create address."));
        }
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data."));
}
?>
