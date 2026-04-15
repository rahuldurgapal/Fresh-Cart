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

    // Step 1: Delete reviews linked to this category's products
    $stmt = $db->prepare("DELETE r FROM reviews r INNER JOIN products p ON r.product_id = p.id WHERE p.category_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();

    // Step 2: Delete order_items linked to this category's products
    $stmt2 = $db->prepare("DELETE oi FROM order_items oi INNER JOIN products p ON oi.product_id = p.id WHERE p.category_id = ?");
    $stmt2->bind_param("i", $id);
    $stmt2->execute();

    // Step 3: Delete all products in this category
    $stmt3 = $db->prepare("DELETE FROM products WHERE category_id = ?");
    $stmt3->bind_param("i", $id);
    $stmt3->execute();

    // Step 4: Delete the category itself
    if ($category->delete()) {
        http_response_code(200);
        echo json_encode(array("message" => "Category and its products deleted successfully."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to delete category."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Category ID is required."));
}
?>
