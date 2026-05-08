<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 1. Read API Key from .env or config (Fallback to a hardcoded string for demonstration, though user will provide it)
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
    echo json_encode(["message" => "GEMINI_API_KEY is missing. Please add it to the backend .env file."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

if (empty($data->image_base64)) {
    http_response_code(400);
    echo json_encode(["message" => "Image data is required (base64 encoded)."]);
    exit();
}

// Extract base64 (remove data:image/jpeg;base64, prefix if present)
$base64 = $data->image_base64;
if (strpos($base64, ',') !== false) {
    $base64 = explode(',', $base64)[1];
}

// 2. Call Gemini API
// 2. Call Gemini API
$url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=' . $apiKey;

$payload = [
    "contents" => [
        [
            "parts" => [
                ["text" => "Extract all grocery ingredients from this recipe image and return a simple JSON array of strings like ['Tomatoes', 'Onions', 'Garlic', 'Chicken']. Only return the JSON array, no markdown block code, no extra text. Strictly start with [ and end with ]."],
                [
                    "inlineData" => [
                        "mimeType" => "image/jpeg",
                        "data" => $base64
                    ]
                ]
            ]
        ]
    ],
    "generationConfig" => [
        "temperature" => 0.1,
        "response_mime_type" => "application/json",
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
    echo json_encode(["message" => "AI Engine failed to process image.", "error" => $response]);
    exit();
}

$resData = json_decode($response, true);
$aiText = $resData['candidates'][0]['content']['parts'][0]['text'] ?? '[]';

// Clean AI output (remove markdown codeblocks if any)
$aiText = str_replace(['```json', '```'], '', $aiText);
$ingredients = json_decode(trim($aiText), true);

if (!is_array($ingredients)) {
    http_response_code(400);
    echo json_encode(["message" => "Could not extract ingredients. AI Output: " . $aiText]);
    exit();
}

// 3. Match ingredients with Database Products
$database = new Database();
$db = $database->getConnection();

$matched_products = [];
foreach ($ingredients as $ingredient) {
    // Basic LIKE search
    $search_term = "%" . $ingredient . "%";
    $query = "SELECT id, name, price, image_path, stock, unit FROM products WHERE name LIKE ? AND status = 'Active' LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bind_param("s", $search_term);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        $product = $result->fetch_assoc();
        // Return full URL for image
        $base_url = "http://" . $_SERVER['HTTP_HOST'] . "/grocery-backend";
        $product['image_path'] = strpos($product['image_path'], 'http') === 0 ? $product['image_path'] : $base_url . $product['image_path'];
        $product['ai_ingredient'] = $ingredient;
        $matched_products[] = $product;
    }
}

echo json_encode([
    "message" => "Ingredients extracted and matched.",
    "ingredients_found" => $ingredients,
    "matched_products" => $matched_products
]);
?>
