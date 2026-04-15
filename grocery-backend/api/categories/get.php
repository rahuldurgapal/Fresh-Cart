<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/Category.php';

$database = new Database();
$db       = $database->getConnection();
$category = new Category($db);

$result   = $category->readAll();
$rowCount = $result->num_rows;

if ($rowCount > 0) {
    $arr = array("records" => array());
    while ($row = $result->fetch_assoc()) {
        array_push($arr["records"], $row);
    }
    http_response_code(200);
    echo json_encode($arr);
} else {
    http_response_code(200);
    echo json_encode(array("records" => []));
}
?>
