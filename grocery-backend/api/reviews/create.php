<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/Review.php';

$database = new Database();
$db       = $database->getConnection();
$review   = new Review($db);

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

if (!empty($data->product_id) && !empty($data->user_name) && !empty($data->rating)) {
    $review->product_id = intval($data->product_id);
    $review->user_name  = $data->user_name;
    $review->rating     = intval($data->rating);
    $review->comment    = isset($data->comment) ? $data->comment : '';

    if ($review->create()) {
        http_response_code(201);
        echo json_encode(array("message" => "Review submitted successfully."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to submit review."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "product_id, user_name, and rating are required."));
}
?>
