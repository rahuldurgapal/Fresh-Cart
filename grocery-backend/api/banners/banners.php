<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';

$database = new Database();
$db       = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $result = $db->query("SELECT * FROM banners ORDER BY sort_order ASC, created_at DESC");
    $arr    = array("records" => array());
    while ($row = $result->fetch_assoc()) {
        array_push($arr["records"], $row);
    }
    http_response_code(200);
    echo json_encode($arr);

} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    if (!empty($data->title)) {
        $image_path = null;
        if (!empty($data->image) && strpos($data->image, 'data:image') === 0) {
            $parts = explode(";base64,", $data->image);
            if (count($parts) === 2) {
                $ext  = explode("image/", $parts[0])[1];
                $file = uniqid('banner_') . '.' . $ext;
                if (file_put_contents('../../uploads/' . $file, base64_decode($parts[1]))) {
                    $image_path = '/uploads/' . $file;
                }
            }
        }
        $stmt = $db->prepare("INSERT INTO banners (title, subtitle, button_text, button_link, bg_color, image_path, status) VALUES (?,?,?,?,?,?,?)");
        $title    = htmlspecialchars($data->title);
        $subtitle = htmlspecialchars($data->subtitle ?? '');
        $btn_text = htmlspecialchars($data->button_text ?? 'Shop Now');
        $btn_link = htmlspecialchars($data->button_link ?? '/');
        $bg       = htmlspecialchars($data->bg_color ?? '#22c55e');
        $status   = $data->status ?? 'Active';
        $stmt->bind_param("sssssss", $title, $subtitle, $btn_text, $btn_link, $bg, $image_path, $status);
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(array("message" => "Banner created."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Failed to create banner."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "Title required."));
    }

} elseif ($method === 'DELETE') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    if ($id) {
        $stmt = $db->prepare("DELETE FROM banners WHERE id = ?");
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(array("message" => "Banner deleted."));
        } else {
            http_response_code(503);
            echo json_encode(array("message" => "Failed to delete banner."));
        }
    } else {
        http_response_code(400);
        echo json_encode(array("message" => "ID required."));
    }
}
?>
