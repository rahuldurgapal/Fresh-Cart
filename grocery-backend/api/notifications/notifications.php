<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';
require_once '../../config/JWT.php';

$database = new Database();
$db       = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// ── GET — Fetch notifications ──────────────────────────────────────────────
if ($method === 'GET') {
    $role     = $_GET['role']     ?? '';
    $agent_id = isset($_GET['agent_id']) ? intval($_GET['agent_id']) : null;
    $unread_only = isset($_GET['unread']) && $_GET['unread'] === '1';

    if (!in_array($role, ['Admin', 'Delivery Agent'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid role.']);
        exit;
    }

    if ($role === 'Admin') {
        // Admin sees all Admin-role notifications
        $where = "WHERE role = 'Admin'";
        $where .= $unread_only ? " AND is_read = 0" : "";
        $stmt = $db->prepare("SELECT * FROM notifications $where ORDER BY created_at DESC LIMIT 50");
        $stmt->execute();
    } else {
        // Delivery agent sees: broadcast notifications (agent_id IS NULL) + their own
        $where = "WHERE role = 'Delivery Agent' AND (agent_id IS NULL OR agent_id = ?)";
        $where .= $unread_only ? " AND is_read = 0" : "";
        $stmt = $db->prepare("SELECT * FROM notifications $where ORDER BY created_at DESC LIMIT 50");
        $stmt->bind_param("i", $agent_id);
        $stmt->execute();
    }

    $result = $stmt->get_result();
    $records = [];
    while ($row = $result->fetch_assoc()) $records[] = $row;

    $unread_count = array_reduce($records, fn($c, $r) => $c + ($r['is_read'] == 0 ? 1 : 0), 0);

    http_response_code(200);
    echo json_encode(['records' => $records, 'unread_count' => $unread_count]);
    exit;
}

// ── POST — Mark as read ───────────────────────────────────────────────────
if ($method === 'POST') {
    $data     = json_decode(file_get_contents('php://input'), true);
    $id       = intval($data['id']       ?? 0);
    $mark_all = $data['mark_all']        ?? false;
    $role     = $data['role']            ?? '';
    $agent_id = isset($data['agent_id']) ? intval($data['agent_id']) : null;

    if ($mark_all) {
        if ($role === 'Admin') {
            $stmt = $db->prepare("UPDATE notifications SET is_read = 1 WHERE role = 'Admin'");
        } else {
            $stmt = $db->prepare("UPDATE notifications SET is_read = 1 WHERE role = 'Delivery Agent' AND (agent_id IS NULL OR agent_id = ?)");
            $stmt->bind_param("i", $agent_id);
        }
    } else {
        $stmt = $db->prepare("UPDATE notifications SET is_read = 1 WHERE id = ?");
        $stmt->bind_param("i", $id);
    }

    $stmt->execute();
    http_response_code(200);
    echo json_encode(['message' => 'Marked as read.', 'affected' => $stmt->affected_rows]);
    exit;
}

http_response_code(405);
echo json_encode(['message' => 'Method not allowed.']);
?>
