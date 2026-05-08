<?php
require_once 'config/database.php';
$database = new Database();
$db = $database->getConnection();

$queries = [
    "ALTER TABLE users ADD COLUMN is_verified TINYINT(1) DEFAULT 0",
    "ALTER TABLE users ADD COLUMN verification_code VARCHAR(10) DEFAULT NULL",
    "ALTER TABLE users ADD COLUMN oauth_id VARCHAR(255) DEFAULT NULL",
    "ALTER TABLE users ADD COLUMN oauth_provider VARCHAR(50) DEFAULT NULL",
    "ALTER TABLE users MODIFY COLUMN email VARCHAR(255) NULL", // Email might be null for phone-only signup
    "ALTER TABLE users ADD COLUMN phone VARCHAR(20) UNIQUE DEFAULT NULL" // Ensuring phone is unique and exists
];

foreach ($queries as $q) {
    if ($db->query($q)) {
        echo "[SUCCESS] $q\n";
    } else {
        echo "[ERROR] " . $db->error . " | Query: $q\n";
    }
}
?>
