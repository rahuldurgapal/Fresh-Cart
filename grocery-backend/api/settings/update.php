<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';
require_once '../../models/Setting.php';

$database = new Database();
$db = $database->getConnection();
$setting = new Setting($db);

$data = json_decode(file_get_contents("php://input"));

if(!empty($data->store_name)){
    $setting->store_name = $data->store_name;
    $setting->support_email = $data->support_email;
    $setting->support_phone = $data->support_phone;
    $setting->currency = $data->currency;
    $setting->delivery_fee = $data->delivery_fee;
    $setting->free_delivery_threshold = $data->free_delivery_threshold;

    if($setting->update()){
        http_response_code(200);
        echo json_encode(array("message" => "Settings updated successfully."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to update settings."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data."));
}
?>
