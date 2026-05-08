<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/Staff.php';

$database = new Database();
$db       = $database->getConnection();
$user     = new Staff($db);

$data = json_decode(file_get_contents("php://input"));

if (empty($data->phone) || empty($data->otp) || empty($data->new_password)) {
    http_response_code(400);
    echo json_encode(["message" => "Phone, OTP, and New Password are required."]);
    exit;
}

if (strlen($data->new_password) < 6) {
    http_response_code(400);
    echo json_encode(["message" => "New password must be at least 6 characters long."]);
    exit;
}

// Find the delivery agent by phone
$query = "SELECT id, status, verification_code FROM staff WHERE phone = ? AND role = 'Delivery Agent' LIMIT 1";
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

// Verify OTP
if ($agent['verification_code'] !== $data->otp) {
    http_response_code(401);
    echo json_encode(["message" => "Invalid OTP entered."]);
    exit;
}

// Update the password and clear OTP
$hashed_password = password_hash($data->new_password, PASSWORD_DEFAULT);
$update_query = "UPDATE staff SET password = ?, verification_code = NULL WHERE id = ?";
$update_stmt = $db->prepare($update_query);
$update_stmt->bind_param("si", $hashed_password, $agent['id']);

if ($update_stmt->execute()) {
    http_response_code(200);
    echo json_encode(["message" => "Password reset successfully. You can now login."]);
} else {
    http_response_code(503);
    echo json_encode(["message" => "Unable to reset password. Please try again."]);
}
?>
