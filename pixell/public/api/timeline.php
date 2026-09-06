<?php
declare(strict_types=1);
require_once __DIR__ . '/_common.php';

$pdo = api_pdo();
$method = $_SERVER['REQUEST_METHOD'];
$body = api_request_json();
$action = strtolower((string)($body['action'] ?? $_GET['action'] ?? $body['_method'] ?? $_GET['_method'] ?? ''));

if ($method === 'GET') {
    $rows = $pdo->query(
        "SELECT id, title, date_string, category, badge_color, image_url, created_at FROM timeline ORDER BY id ASC"
    )->fetchAll();

    api_json(['success' => true, 'timeline' => array_map('api_timeline_row', $rows ?: [])]);
}

if ($method === 'DELETE' || $action === 'delete') {
    $id = (int)($_GET['id'] ?? $body['id'] ?? 0);
    if (!$id) {
        api_json(['error' => 'ID acara wajib disertakan'], 400);
    }

    $stmt = $pdo->prepare("DELETE FROM timeline WHERE id = ?");
    $stmt->execute([$id]);

    api_json(['success' => true, 'message' => 'Acara timeline berhasil dihapus']);
}

if ($method === 'PUT' || $action === 'update' || $action === 'put' || (isset($body['id']) && (int)$body['id'] > 0 && $method === 'POST')) {
    $id = (int)($body['id'] ?? $_GET['id'] ?? 0);
    if ($id > 0) {
        $fields = [];
        $values = [];
        if (array_key_exists('title', $body)) { $fields[] = 'title = ?'; $values[] = trim((string)$body['title']); }
        if (array_key_exists('date', $body)) { $fields[] = 'date_string = ?'; $values[] = trim((string)$body['date']); }
        if (array_key_exists('category', $body)) { $fields[] = 'category = ?'; $values[] = trim((string)$body['category']); }
        if (array_key_exists('badgeColor', $body)) { $fields[] = 'badge_color = ?'; $values[] = (string)$body['badgeColor']; }
        if (array_key_exists('imageUrl', $body)) { $fields[] = 'image_url = ?'; $values[] = (string)$body['imageUrl']; }

        if ($fields) {
            $values[] = $id;
            $stmt = $pdo->prepare('UPDATE timeline SET ' . implode(', ', $fields) . ' WHERE id = ?');
            $stmt->execute($values);
        }

        $stmt = $pdo->prepare(
            "SELECT id, title, date_string, category, badge_color, image_url, created_at FROM timeline WHERE id = ?"
        );
        $stmt->execute([$id]);
        $item = $stmt->fetch();

        api_json(['success' => true, 'item' => $item ? api_timeline_row($item) : null]);
    }
}

if ($method === 'POST') {
    $title = trim((string)($body['title'] ?? ''));
    $date = trim((string)($body['date'] ?? ''));
    if ($title === '' || $date === '') {
        api_json(['error' => 'Judul dan Tanggal agenda wajib diisi!'], 400);
    }

    $stmt = $pdo->prepare(
        "INSERT INTO timeline (title, date_string, category, badge_color, image_url) VALUES (?, ?, ?, ?, ?)"
    );
    $stmt->execute([
        $title,
        $date,
        trim((string)($body['category'] ?? 'AGENDA')) ?: 'AGENDA',
        (string)($body['badgeColor'] ?? 'pink'),
        (string)($body['imageUrl'] ?? ''),
    ]);

    $id = (int)$pdo->lastInsertId();
    $stmt = $pdo->prepare(
        "SELECT id, title, date_string, category, badge_color, image_url, created_at FROM timeline WHERE id = ?"
    );
    $stmt->execute([$id]);
    $item = $stmt->fetch();

    api_json(['success' => true, 'item' => $item ? api_timeline_row($item) : null], 201);
}

api_json(['error' => 'Method not allowed'], 405);
