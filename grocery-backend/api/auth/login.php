<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/User.php';

$database = new Database();
$db       = $database->getConnection();
$user     = new User($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->password)) {
    $user->email    = $data->email;
    $email_exists   = $user->emailExists();

    if ($email_exists && password_verify($data->password, $user->password)) {
        if ($user->status === 'Active') {
            require_once '../../config/JWT.php';
            $payload = [
                "id" => $user->id,
                "email" => $user->email,
                "role" => $user->role,
                "exp" => time() + (24 * 60 * 60) // 24 hours
            ];
            $token = JWT::encode($payload, $database->getJWTSecret());

            http_response_code(200);
            echo json_encode(array(
                "message" => "Successful login.",
                "token"   => $token,
                "user"    => array(
                    "id"    => $user->id,
                    "name"  => $user->name,
                    "email" => $user->email,
                    "phone" => $user->phone,
                    "role"  => $user->role
                )
            ));
        } else {
            http_response_code(401);
            echo json_encode(array("message" => "Account is blocked or inactive."));
        }
    } else {
        http_response_code(401);
        echo json_encode(array("message" => "Invalid email or password."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Login failed. Data is incomplete."));
}
?>
