<?php
declare(strict_types=1);
require_once __DIR__ . '/_common.php';

$pdo = api_pdo();
$method = $_SERVER['REQUEST_METHOD'];
$body = api_request_json();
$action = strtolower((string)($body['action'] ?? $_GET['action'] ?? $body['_method'] ?? $_GET['_method'] ?? ''));

if ($method === 'GET') {
    $rows = $pdo->query(
        "SELECT id, title, category, category_label, description, icon_type, badge_color, gform_url, guidebook_url, mascot_url, created_at FROM events ORDER BY id ASC"
    )->fetchAll();

    $events = array_map('api_event_row', $rows ?: []);
    api_json($events);
}

if ($method === 'DELETE' || $action === 'delete') {
    $id = trim((string)($_GET['id'] ?? $body['id'] ?? ''));
    if ($id === '') {
        api_json(['error' => 'Event ID is required'], 400);
    }

    $stmt = $pdo->prepare("DELETE FROM events WHERE id = ?");
    $stmt->execute([$id]);

    api_json(['success' => true, 'message' => 'Event berhasil dihapus']);
}

if ($method === 'PUT' || $action === 'update' || $action === 'put' || (isset($body['id']) && trim((string)$body['id']) !== '' && $method === 'POST')) {
    $id = trim((string)($body['id'] ?? $_GET['id'] ?? ''));
    if ($id !== '') {
        $fields = [];
        $values = [];
        if (array_key_exists('gformUrl', $body)) {
            $fields[] = 'gform_url = ?';
            $values[] = (string)$body['gformUrl'];
        }
        if (array_key_exists('guidebookUrl', $body)) {
            $fields[] = 'guidebook_url = ?';
            $values[] = (string)$body['guidebookUrl'];
        }
        if (array_key_exists('mascotUrl', $body)) {
            $fields[] = 'mascot_url = ?';
            $values[] = (string)$body['mascotUrl'];
        }
        if (array_key_exists('title', $body)) {
            $fields[] = 'title = ?';
            $values[] = (string)$body['title'];
        }
        if (array_key_exists('description', $body)) {
            $fields[] = 'description = ?';
            $values[] = (string)$body['description'];
        }

        if ($fields) {
            $values[] = $id;
            $stmt = $pdo->prepare('UPDATE events SET ' . implode(', ', $fields) . ' WHERE id = ?');
            $stmt->execute($values);
        }

        $stmt = $pdo->prepare(
            "SELECT id, title, category, category_label, description, icon_type, badge_color, gform_url, guidebook_url, mascot_url, created_at FROM events WHERE id = ?"
        );
        $stmt->execute([$id]);
        $event = $stmt->fetch();

        api_json(['success' => true, 'message' => 'Event berhasil diperbarui', 'event' => $event ? api_event_row($event) : null]);
    }
}

if ($method === 'POST') {
    $title = trim((string)($body['title'] ?? ''));
    $category = trim((string)($body['category'] ?? 'kompetisi'));
    $categoryLabel = trim((string)($body['categoryLabel'] ?? strtoupper($category)));
    $description = trim((string)($body['description'] ?? ''));
    $iconType = trim((string)($body['iconType'] ?? 'code'));
    $badgeColor = trim((string)($body['badgeColor'] ?? 'cyan'));
    $gformUrl = trim((string)($body['gformUrl'] ?? 'https://forms.google.com/'));
    $guidebookUrl = trim((string)($body['guidebookUrl'] ?? ''));
    $mascotUrl = trim((string)($body['mascotUrl'] ?? ''));

    if ($title === '') {
        api_json(['error' => 'Judul event wajib diisi'], 400);
    }

    $id = trim((string)($body['id'] ?? ''));
    if ($id === '') {
        $id = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $title));
    }

    $stmt = $pdo->prepare(
        "INSERT INTO events (id, title, category, category_label, description, icon_type, badge_color, gform_url, guidebook_url, mascot_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([
        $id,
        $title,
        $category,
        $categoryLabel,
        $description,
        $iconType,
        $badgeColor,
        $gformUrl,
        $guidebookUrl,
        $mascotUrl ?: null
    ]);

    $stmt = $pdo->prepare(
        "SELECT id, title, category, category_label, description, icon_type, badge_color, gform_url, guidebook_url, mascot_url, created_at FROM events WHERE id = ?"
    );
    $stmt->execute([$id]);
    $event = $stmt->fetch();

    api_json(['success' => true, 'message' => 'Event berhasil ditambahkan', 'event' => $event ? api_event_row($event) : null], 201);
}

api_json(['error' => 'Method not allowed'], 405);
