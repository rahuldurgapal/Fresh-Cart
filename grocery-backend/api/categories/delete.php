<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/Category.php';

$database = new Database();
$db       = $database->getConnection();
$category = new Category($db);

$id = null;
if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
} else {
    $data = json_decode(file_get_contents("php://input"));
    if (isset($data->id)) $id = intval($data->id);
}

if (!empty($id)) {
    $category->id = $id;

    // Check if category has any products attached
    $check_stmt = $db->prepare("SELECT id FROM products WHERE category_id = ?");
    $check_stmt->bind_param("i", $id);
    $check_stmt->execute();
    $result = $check_stmt->get_result();

    if ($result->num_rows > 0) {
        http_response_code(400); // Conflict / Bad Request
        echo json_encode(array("message" => "Cannot delete category. It still contains products. Please move or delete the products first."));
        exit;
    }

    // Since it's empty, we can safely delete the category itself
    if ($category->delete()) {
        http_response_code(200);
        echo json_encode(array("message" => "Category deleted successfully."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to delete category."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Category ID is required."));
}
?>
