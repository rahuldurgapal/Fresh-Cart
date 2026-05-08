<?php
require_once '../../config/headers.php';
require_once '../../config/database.php';

$database = new Database();
$db       = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

// ── GET — Fetch all Delivery Agents ─────────────────────────────────────────
if ($method === 'GET') {
    $stmt = $db->prepare("SELECT id, name, email, phone, status, created_at
                          FROM staff
                          WHERE role = 'Delivery Agent'
                          ORDER BY id DESC");
    $stmt->execute();
    $result = $stmt->get_result();
    $agents = [];
    while ($row = $result->fetch_assoc()) $agents[] = $row;
    http_response_code(200);
    echo json_encode(['records' => $agents, 'total' => count($agents)]);
    exit;
}

// ── POST — Create new Delivery Agent ────────────────────────────────────────
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $name     = trim($data['name']     ?? '');
    $email    = trim($data['email']    ?? '');
    $phone    = trim($data['phone']    ?? '');
    $password = trim($data['password'] ?? '');
    $status   = $data['status']        ?? 'Active';

    if (!$name || !$email || !$password) {
        http_response_code(400);
        echo json_encode(['message' => 'Name, Email, and Password are required.']);
        exit;
    }

    // Check duplicate email
    $check = $db->prepare("SELECT id FROM staff WHERE email = ?");
    $check->bind_param("s", $email);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
        http_response_code(409);
        echo json_encode(['message' => 'An account with this email already exists.']);
        exit;
    }

    $hashed = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $db->prepare("INSERT INTO staff (name, email, phone, password, role, status)
                          VALUES (?, ?, ?, ?, 'Delivery Agent', ?)");
    $stmt->bind_param("sssss", $name, $email, $phone, $hashed, $status);

    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(['message' => 'Delivery Agent created successfully.', 'id' => $db->insert_id]);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Failed to create agent.']);
    }
    exit;
}

// ── PUT — Update Delivery Agent ──────────────────────────────────────────────
if ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);

    $id     = intval($data['id']    ?? 0);
    $name   = trim($data['name']   ?? '');
    $phone  = trim($data['phone']  ?? '');
    $status = $data['status']      ?? 'Active';

    if (!$id || !$name) {
        http_response_code(400);
        echo json_encode(['message' => 'ID and Name are required.']);
        exit;
    }

    // Optional: reset password if provided
    if (!empty(trim($data['password'] ?? ''))) {
        $hashed = password_hash(trim($data['password']), PASSWORD_DEFAULT);
        $stmt = $db->prepare("UPDATE staff SET name=?, phone=?, status=?, password=? WHERE id=? AND role='Delivery Agent'");
        $stmt->bind_param("ssssi", $name, $phone, $status, $hashed, $id);
    } else {
        $stmt = $db->prepare("UPDATE staff SET name=?, phone=?, status=? WHERE id=? AND role='Delivery Agent'");
        $stmt->bind_param("sssi", $name, $phone, $status, $id);
    }

    if ($stmt->execute() && $stmt->affected_rows > 0) {
        http_response_code(200);
        echo json_encode(['message' => 'Agent updated successfully.']);
    } else {
        http_response_code(404);
        echo json_encode(['message' => 'Agent not found or no changes made.']);
    }
    exit;
}

// ── DELETE — Remove Delivery Agent ──────────────────────────────────────────
if ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id   = intval($data['id'] ?? 0);

    if (!$id) {
        http_response_code(400);
        echo json_encode(['message' => 'Agent ID is required.']);
        exit;
    }

    // Unassign from any active orders first
    $db->prepare("UPDATE orders SET delivery_agent_id = NULL WHERE delivery_agent_id = ? AND status != 'Delivered'")->execute();

    $stmt = $db->prepare("DELETE FROM staff WHERE id=? AND role='Delivery Agent'");
    $stmt->bind_param("i", $id);

    if ($stmt->execute() && $stmt->affected_rows > 0) {
        http_response_code(200);
        echo json_encode(['message' => 'Agent removed successfully.']);
    } else {
        http_response_code(404);
        echo json_encode(['message' => 'Agent not found.']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['message' => 'Method not allowed.']);
?>
