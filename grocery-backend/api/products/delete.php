<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/Product.php';

$database = new Database();
$db       = $database->getConnection();
$product  = new Product($db);

$id = null;
if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
} else {
    $data = json_decode(file_get_contents("php://input"));
    if (isset($data->id)) $id = intval($data->id);
}

if (!empty($id)) {
    $product->id = $id;

    // Step 1: Delete related reviews
    $stmt = $db->prepare("DELETE FROM reviews WHERE product_id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();

    // Step 2: Delete related order_items
    $stmt2 = $db->prepare("DELETE FROM order_items WHERE product_id = ?");
    $stmt2->bind_param("i", $id);
    $stmt2->execute();

    // Step 3: Delete the product
    if ($product->delete()) {
        http_response_code(200);
        echo json_encode(array("message" => "Product deleted successfully."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to delete product."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Product ID is required."));
}
?>
