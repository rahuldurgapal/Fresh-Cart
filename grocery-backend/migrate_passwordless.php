<?php
require_once 'config/database.php';
$database = new Database();
$db = $database->getConnection();

$q = "ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL";

if ($db->query($q)) {
    echo "[SUCCESS] Users table updated successfully (Password allowed as NULL).\n";
} else {
    echo "[ERROR] " . $db->error . "\n";
}
?>
