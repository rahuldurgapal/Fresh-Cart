<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 1. Read API Key
$envFile = __DIR__ . '/../../.env';
$apiKey = '';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        if (trim($name) === 'GEMINI_API_KEY') {
            $apiKey = trim($value);
        }
    }
}

if (empty($apiKey) || $apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    http_response_code(500);
    echo json_encode(["message" => "GEMINI_API_KEY is missing."]);
    exit();
}

$product_id = isset($_GET['product_id']) ? intval($_GET['product_id']) : 0;
if ($product_id <= 0) {
    http_response_code(400);
    echo json_encode(["message" => "Valid product_id is required."]);
    exit();
}

$database = new Database();
$db = $database->getConnection();

// Get the out-of-stock product details
$stmt = $db->prepare("SELECT id, name, category, price FROM products WHERE id = ?");
$stmt->bind_param("i", $product_id);
$stmt->execute();
$outOfStockProduct = $stmt->get_result()->fetch_assoc();

if (!$outOfStockProduct) {
    http_response_code(404);
    echo json_encode(["message" => "Product not found."]);
    exit();
}

// Get other active products in the same category to provide to AI as options
$stmt2 = $db->prepare("SELECT id, name, price FROM products WHERE category = ? AND id != ? AND status = 'Active' AND stock > 0 LIMIT 15");
$stmt2->bind_param("si", $outOfStockProduct['category'], $product_id);
$stmt2->execute();
$res2 = $stmt2->get_result();

$available_options = [];
while ($row = $res2->fetch_assoc()) {
    $available_options[] = $row['id'] . ":" . $row['name'];
}

if (empty($available_options)) {
    echo json_encode(["message" => "No substitutes available in the same category.", "substitute_product_id" => null]);
    exit();
}

$optionsText = implode(", ", $available_options);
$prompt = "A customer tried to buy '{$outOfStockProduct['name']}' but it is out of stock. Based on the following available products in our inventory: [{$optionsText}], reply with ONLY the ID of the best dietary substitute. Do not include any text, just the numeric ID.";

// 2. Call Gemini API
$url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=' . $apiKey;

$payload = [
    "contents" => [
        [
            "parts" => [
                ["text" => $prompt]
            ]
        ]
    ],
    "generationConfig" => [
        "temperature" => 0.2
    ]
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpcode !== 200) {
    http_response_code(500);
    echo json_encode(["message" => "AI Engine failed to get substitute.", "error" => $response]);
    exit();
}

$resData = json_decode($response, true);
$aiText = $resData['candidates'][0]['content']['parts'][0]['text'] ?? '';
$suggested_id = intval(trim($aiText));

if ($suggested_id > 0) {
    // Fetch suggested product details
    $stmt3 = $db->prepare("SELECT id, name, price, image_path, unit FROM products WHERE id = ?");
    $stmt3->bind_param("i", $suggested_id);
    $stmt3->execute();
    $substitute = $stmt3->get_result()->fetch_assoc();
    
    if ($substitute) {
        $base_url = "http://" . $_SERVER['HTTP_HOST'] . "/grocery-backend";
        $substitute['image_path'] = strpos($substitute['image_path'], 'http') === 0 ? $substitute['image_path'] : $base_url . $substitute['image_path'];
        
        echo json_encode([
            "message" => "AI found a substitute.",
            "substitute" => $substitute
        ]);
        exit();
    }
}

echo json_encode(["message" => "AI could not find a suitable substitute.", "substitute_product_id" => null]);
?>
