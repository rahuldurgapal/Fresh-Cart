<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/Customer.php';
require_once '../../config/JWT.php';

$database = new Database();
$db = $database->getConnection();
$user = new Customer($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->phone) && !empty($data->otp)) {
    $user->phone = $data->phone;

    if ($user->phoneExists()) {
        if ($user->verification_code === $data->otp) {
            
            if ($user->status === 'Active') {
                // Mark as verified and clear OTP
                $user->verifyAccount(); 
                
                $payload = [
                    "id" => $user->id,
                    "phone" => $user->phone,
                    "role" => "Customer",
                    "exp" => time() + (24 * 60 * 60)
                ];
                $token = JWT::encode($payload, $database->getJWTSecret());

                http_response_code(200);
                echo json_encode(array(
                    "message" => "Succesful login.",
                    "token"   => $token,
                    "user"    => array(
                        "id"    => $user->id,
                        "name"  => $user->name,
                        "phone" => $user->phone,
                        "role"  => "Customer"
                    )
                ));
            } else {
                http_response_code(401);
                echo json_encode(array("message" => "Account is blocked."));
            }
        } else {
            http_response_code(401);
            echo json_encode(array("message" => "Invalid OTP entered."));
        }
    } else {
        http_response_code(404);
        echo json_encode(array("message" => "User not found."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Phone and OTP are required."));
}
?>
