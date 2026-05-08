<?php
require_once '../../config/headers.php';

// Production Note: These should ideally be in env vars.
$keyId = 'rzp_test_Se4Ryctgw7fnL4';
$keySecret = '7hxz2TwDOv3aLoRDK1eamxKe';

$data = json_decode(file_get_contents("php://input"));
if (empty($data->amount) || empty($data->receipt)) {
    http_response_code(400);
    echo json_encode(["message" => "Amount and receipt ID are required."]);
    exit;
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.razorpay.com/v1/orders");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);
// Razorpay expects amount in paise (multiply by 100)
$payload = [
    "amount" => intval($data->amount * 100), 
    "currency" => "INR",
    "receipt" => "rcpt_" . $data->receipt
];
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_USERPWD, $keyId . ":" . $keySecret);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);

$result = curl_exec($ch);
if (curl_errno($ch)) {
    http_response_code(503);
    echo json_encode(["message" => "cURL Error: " . curl_error($ch)]);
} else {
    http_response_code(200);
    echo $result;
}
curl_close($ch);
?>
