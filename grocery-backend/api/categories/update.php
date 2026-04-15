<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/Category.php';

$database = new Database();
$db       = $database->getConnection();
$category = new Category($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->name)) {
    $category->id     = $data->id;
    $category->name   = $data->name;
    $category->status = isset($data->status) ? $data->status : 'Active';

    if ($category->update()) {
        http_response_code(200);
        echo json_encode(array("message" => "Category updated successfully."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to update category."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data."));
}
?>
