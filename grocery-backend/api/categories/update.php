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

    // Handle Base64 Image
    $category->image_path = null;
    if (!empty($data->image) && strpos($data->image, 'data:image') === 0) {
        $parts = explode(";base64,", $data->image);
        if (count($parts) === 2) {
            $ext  = explode("image/", $parts[0])[1];
            $file = uniqid() . '.' . $ext;
            // Create directory if it doesn't exist
            if (!is_dir('../../uploads/categories')) {
                mkdir('../../uploads/categories', 0777, true);
            }
            if (file_put_contents('../../uploads/categories/' . $file, base64_decode($parts[1]))) {
                $category->image_path = '/uploads/categories/' . $file;
            }
        }
    }

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
