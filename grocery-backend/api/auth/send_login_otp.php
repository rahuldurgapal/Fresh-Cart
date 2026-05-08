<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../models/Customer.php';

$database = new Database();
$db = $database->getConnection();
$user = new Customer($db);

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->phone)) {
    $phone = $data->phone;
    $ip = $_SERVER['REMOTE_ADDR'];

    /* 
    // --- Rate Limiting: Check IP Limits (Max 5 per 15 min) ---
    $ip_stmt = $db->prepare("SELECT COUNT(*) as count FROM otp_logs WHERE ip_address = ? AND requested_at >= NOW() - INTERVAL 15 MINUTE");
    $ip_stmt->bind_param("s", $ip);
    $ip_stmt->execute();
    if ($ip_stmt->get_result()->fetch_assoc()['count'] >= 5) {
        http_response_code(429);
        echo json_encode(array("message" => "Too many requests from this IP. Try again in 15 minutes."));
        exit;
    }

    // --- Rate Limiting: Check Phone Limits (Max 3 per 15 min) ---
    $phone_stmt = $db->prepare("SELECT COUNT(*) as count FROM otp_logs WHERE phone_number = ? AND requested_at >= NOW() - INTERVAL 15 MINUTE");
    $phone_stmt->bind_param("s", $phone);
    $phone_stmt->execute();
    if ($phone_stmt->get_result()->fetch_assoc()['count'] >= 3) {
        http_response_code(429);
        echo json_encode(array("message" => "Too many OTP requests for this number. Try again in 15 minutes."));
        exit;
    }
    */

    $user->phone = $phone;
    
    if (!$user->phoneExists()) {
        // Create skeleton user for new phone number
        $user->name = "User " . substr($phone, -4);
        $user->status = 'Active';
        
        if (!$user->register()) {
            http_response_code(500);
            echo json_encode(array("message" => "Failed to initiate registration."));
            exit;
        }
    }

    $otp = strval(rand(100000, 999999));
    
    if ($user->setVerificationCode($otp)) {
        
        // Log the request to otp_logs
        $log_stmt = $db->prepare("INSERT INTO otp_logs (phone_number, ip_address) VALUES (?, ?)");
        $log_stmt->bind_param("ss", $phone, $ip);
        $log_stmt->execute();

        // 1. Check for Developer Testing Bypass
        if ($phone === '7307177303') {
            http_response_code(200);
            echo json_encode([
                "status" => "success", 
                "message" => "Developer Mode: Use OTP 123456",
                "demo_otp" => "123456" 
            ]);
            // Update the user's verification code in DB so 123456 works
            $user->setVerificationCode("123456");
            exit;
        }

        // 2. Send REAL Voice OTP via 2Factor.in
        $apiKey = $database->get2FactorApiKey();
        
        if (!empty($apiKey) && $apiKey !== 'YOUR_2FACTOR_API_KEY') {
            // ---- LIVE VOICE MODE ----
            // API Endpoint for Voice: https://2factor.in/API/V1/{api_key}/VOICE/{phone_number}/{otp_value}
            $url = "https://2factor.in/API/V1/$apiKey/VOICE/$phone/$otp";

            $curl = curl_init();
            curl_setopt_array($curl, array(
                CURLOPT_URL => $url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => "",
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 30,
                CURLOPT_SSL_VERIFYHOST => 0,
                CURLOPT_SSL_VERIFYPEER => 0,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => "GET",
            ));
            
            $response = curl_exec($curl);
            $err = curl_error($curl);
            curl_close($curl);
            
            if ($err) {
                error_log("2Factor Voice Error: " . $err);
            } else {
                $resData = json_decode($response, true);
                if (isset($resData['Status']) && $resData['Status'] !== 'Success') {
                    error_log("2Factor API Error: " . ($resData['Details'] ?? 'Unknown Error'));
                }
            }
        }

        http_response_code(200);
        echo json_encode(array("message" => "OTP sent successfully via Voice Call."));
    } else {
        http_response_code(500);
        echo json_encode(array("message" => "Failed to generate OTP."));
    }
} else {
    http_response_code(400);
    echo json_encode(array("message" => "Phone number is required."));
}
?>
