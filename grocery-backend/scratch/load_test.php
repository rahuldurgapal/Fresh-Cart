<?php
$url = "http://localhost:8000/api/products/get.php";
$concurrent_reqs = 50;
$mh = curl_multi_init();
$ch_list = [];

echo "🚀 Starting PHP Concurrency Test...\n";
echo "📍 Endpoint: $url\n";
echo "👥 Simulating $concurrent_reqs concurrent requests...\n\n";

$start = microtime(true);

for ($i = 0; $i < $concurrent_reqs; $i++) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_multi_add_handle($mh, $ch);
    $ch_list[] = $ch;
}

$active = null;
do {
    $mrc = curl_multi_exec($mh, $active);
} while ($mrc == CURLM_CALL_MULTI_PERFORM);

while ($active && $mrc == CURLM_OK) {
    if (curl_multi_select($mh) != -1) {
        do {
            $mrc = curl_multi_exec($mh, $active);
        } while ($mrc == CURLM_CALL_MULTI_PERFORM);
    }
}

$end = microtime(true);
$successful = 0;
$failed = 0;

foreach ($ch_list as $ch) {
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($http_code == 200) {
        $successful++;
    } else {
        $failed++;
    }
    curl_multi_remove_handle($mh, $ch);
    curl_close($ch);
}
curl_multi_close($mh);

$duration = $end - $start;
$avg = ($duration / $concurrent_reqs) * 1000;

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
echo "✅ Successful Requests : $successful\n";
echo "❌ Failed Requests     : $failed\n";
echo "⏱️  Total Duration      : " . round($duration, 4) . "s\n";
echo "📊 Avg Response Time   : " . round($avg, 2) . "ms\n";
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
?>
