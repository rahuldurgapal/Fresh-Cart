<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/Product.php';

$database = new Database();
$db       = $database->getConnection();
$product  = new Product($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->name) && !empty($data->category_id)) {
    $product->id           = $data->id;
    $product->name         = $data->name;
    $product->description  = isset($data->description) ? $data->description : null;
    $product->storage_tips = isset($data->storage_tips) ? $data->storage_tips : null;
    $product->shelf_life   = isset($data->shelf_life) ? $data->shelf_life : null;
    $product->product_type = isset($data->product_type) ? $data->product_type : null;
    $product->category_id  = $data->category_id;
    $product->price        = $data->price;
    $product->stock        = isset($data->stock) ? $data->stock : 0;
    $product->unit         = isset($data->unit) ? $data->unit : '1 unit';
    $product->status       = isset($data->status) ? $data->status : 'In Stock';

    // Handle Base64 Image
    $product->image_path = null;
    if (!empty($data->image) && strpos($data->image, 'data:image') === 0) {
        $parts = explode(";base64,", $data->image);
        if (count($parts) === 2) {
            $ext  = explode("image/", $parts[0])[1];
            $file = uniqid() . '.' . $ext;
            // Create directory if it doesn't exist
            if (!is_dir('../../uploads/products')) {
                mkdir('../../uploads/products', 0777, true);
            }
            if (file_put_contents('../../uploads/products/' . $file, base64_decode($parts[1]))) {
                $product->image_path = '/uploads/products/' . $file;
            }
        }
    }

    if ($product->update()) {
        http_response_code(200);
        echo json_encode(array("message" => "Product updated successfully."));
    } else {
        http_response_code(503);
        echo json_encode(array("message" => "Unable to update product."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Incomplete data."));
}
?>
