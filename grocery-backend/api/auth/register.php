<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/User.php';

$database = new Database();
$db       = $database->getConnection();
$user     = new User($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->name) && !empty($data->email) && !empty($data->password)) {
    $user->name     = $data->name;
    $user->email    = $data->email;
    $user->phone    = isset($data->phone) ? $data->phone : null;
    $user->password = $data->password;
    $user->role     = isset($data->role) ? $data->role : 'Customer';
    $user->status   = 'Active';

    if ($user->register()) {
        require_once '../../config/JWT.php';
        $payload = [
            "id" => $user->id,
            "email" => $user->email,
            "role" => $user->role,
            "exp" => time() + (24 * 60 * 60)
        ];
        $token = JWT::encode($payload, $database->getJWTSecret());

        http_response_code(201);
        echo json_encode(array(
            "message" => "User was registered.",
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
        http_response_code(400);
        echo json_encode(array("message" => "Email already exists."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Unable to register user. Data is incomplete."));
}
?>
