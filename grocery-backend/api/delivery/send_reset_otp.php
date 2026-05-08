<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/Staff.php';

$database = new Database();
$db       = $database->getConnection();
$user     = new Staff($db);

$data = json_decode(file_get_contents("php://input"));

if (empty($data->phone)) {
    http_response_code(400);
    echo json_encode(["message" => "Phone number is required."]);
    exit;
}

$query = "SELECT id, status FROM staff WHERE phone = ? AND role = 'Delivery Agent' LIMIT 1";
$stmt = $db->prepare($query);
$stmt->bind_param("s", $data->phone);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(404);
    echo json_encode(["message" => "No delivery agent found with this Phone number."]);
    exit;
}

$agent = $result->fetch_assoc();

if ($agent['status'] !== 'Active') {
    http_response_code(403);
    echo json_encode(["message" => "Your account is inactive. Please contact admin."]);
    exit;
}

$user->id = $agent['id'];
$otp = strval(rand(100000, 999999));

if ($user->setVerificationCode($otp)) {
    // In a production environment, send this OTP via SMS API here.
    error_log("MAIL_DEBUG: Delivery Agent Password Reset OTP for Phone {$data->phone} is $otp");
    
    // For demo purposes, we are returning it in the message or logging it. 
    // In production, we just return "OTP sent successfully".
    echo json_encode(["message" => "OTP sent successfully to your mobile number. (Demo OTP: $otp)"]);
} else {
    http_response_code(503);
    echo json_encode(["message" => "Failed to generate OTP. Please try again later."]);
}
?>
