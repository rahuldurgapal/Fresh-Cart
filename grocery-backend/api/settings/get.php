<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../../config/database.php';
require_once '../../models/Setting.php';

$database = new Database();
$db = $database->getConnection();
$setting = new Setting($db);

$data = $setting->get();

if($data){
    http_response_code(200);
    echo json_encode($data);
} else {
    http_response_code(404);
    echo json_encode(array("message" => "Settings not found."));
}
?>
