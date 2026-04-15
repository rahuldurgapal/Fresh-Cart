<?php
require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();

$queries = [
    "CREATE INDEX idx_prod_cat ON products(category_id)",
    "CREATE INDEX idx_orders_user ON orders(user_id)",
    "CREATE INDEX idx_addr_user ON addresses(user_id)",
    "CREATE INDEX idx_rev_prod ON reviews(product_id)"
];

echo "🚀 Starting Database Indexing...\n";

foreach ($queries as $query) {
    echo "Running: $query... ";
    if ($db->query($query)) {
        echo "✅ Success\n";
    } else {
        if ($db->errno == 1061) {
            echo "ℹ️  Index already exists\n";
        } else {
            echo "❌ Error: " . $db->error . "\n";
        }
    }
}

echo "\n✨ Optimization Complete!\n";
?>
