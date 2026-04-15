<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/User.php';

$database = new Database();
$db       = $database->getConnection();
$user     = new User($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    $user->email  = $data->email;
    $email_exists = $user->emailExists();

    if ($email_exists && password_verify($data->password, $user->password)) {
        // Only Super Admin can access admin panel
        if ($user->role === 'Super Admin') {
            http_response_code(200);
            echo json_encode(array(
                "message" => "Admin login successful.",
                "admin"   => array(
                    "id"    => $user->id,
                    "name"  => $user->name,
                    "email" => $user->email,
                    "role"  => $user->role
                )
            ));
        } else {
            http_response_code(403);
            echo json_encode(array("message" => "Access denied. Admin privileges required."));
        }
    } else {
        http_response_code(401);
        echo json_encode(array("message" => "Invalid email or password."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Email and password are required."));
}
?>
