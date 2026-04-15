<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/Address.php';

$database = new Database();
$db       = $database->getConnection();
$address  = new Address($db);

if (isset($_GET['user_id'])) {
    
    // Add JWT Protection
    require_once '../../config/JWT.php';
    $token = JWT::getBearerToken();
    $payload = JWT::decode($token, $database->getJWTSecret());

    if (!$payload || $payload['id'] != $_GET['user_id']) {
        http_response_code(401);
        echo json_encode(array("message" => "Unauthorized access."));
        exit;
    }

    $result = $address->getAllByUserId($_GET['user_id']);
    
    $addresses_arr = array("records" => array());
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            array_push($addresses_arr["records"], $row);
        }
    }
    
    http_response_code(200);
    echo json_encode($addresses_arr);
} else {
    http_response_code(400);
    echo json_encode(array("message" => "User ID required."));
}
?>
