<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/Staff.php';
require_once '../../config/JWT.php';

$database = new Database();
$db       = $database->getConnection();
$user     = new Staff($db);


$data = json_decode(file_get_contents("php://input"));

// Look for 'identifier', fallback to 'email' if old frontend hits it
$identifier = !empty($data->identifier) ? $data->identifier : (!empty($data->email) ? $data->email : null);

if (empty($identifier) || empty($data->password)) {
    http_response_code(400);
    echo json_encode(["message" => "Email/Phone and password are required."]);
    exit;
}

// Find user by email or phone
$query = "SELECT * FROM staff WHERE (email = ? OR phone = ?) AND role = 'Delivery Agent' LIMIT 1";
$stmt = $db->prepare($query);
$stmt->bind_param("ss", $identifier, $identifier);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(["message" => "Invalid credentials or access denied."]);
    exit;
}

$agent_data = $result->fetch_assoc();

if (!password_verify($data->password, $agent_data['password'])) {
    http_response_code(401);
    echo json_encode(["message" => "Invalid email/phone or password."]);
    exit;
}

if ($agent_data['status'] !== 'Active') {
    http_response_code(401);
    echo json_encode(["message" => "Your account has been blocked. Contact admin."]);
    exit;
}

$payload = [
    "id"    => $agent_data['id'],
    "name"  => $agent_data['name'],
    "email" => $agent_data['email'],
    "role"  => $agent_data['role'],
    "exp"   => time() + (24 * 60 * 60)
];
$token = JWT::encode($payload, $database->getJWTSecret());

http_response_code(200);
echo json_encode([
    "message" => "Login successful.",
    "token"   => $token,
    "agent"   => [
        "id"    => $agent_data['id'],
        "name"  => $agent_data['name'],
        "email" => $agent_data['email'],
        "phone" => $agent_data['phone'],
        "role"  => $agent_data['role'],
    ]
]);
?>
