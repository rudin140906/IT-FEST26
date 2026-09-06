<?php
declare(strict_types=1);
require_once __DIR__ . '/_common.php';

$pdo = api_pdo();
$method = $_SERVER['REQUEST_METHOD'];
$body = api_request_json();
$action = strtolower((string)($body['action'] ?? $_GET['action'] ?? $body['_method'] ?? $_GET['_method'] ?? ''));

if ($method === 'GET') {
    $rows = $pdo->query(
        "SELECT id, name, role, category, photo, photo_position, cv, color, created_at FROM speakers ORDER BY id ASC"
    )->fetchAll();

    $speakers = array_map('api_speaker_row', $rows ?: []);
    api_json(['success' => true, 'speakers' => $speakers]);
}

if ($method === 'DELETE' || $action === 'delete') {
    $id = trim((string)($_GET['id'] ?? $body['id'] ?? ''));
    if ($id === '') {
        api_json(['error' => 'ID pemateri wajib disertakan'], 400);
    }

    $stmt = $pdo->prepare("DELETE FROM speakers WHERE id = ?");
    $stmt->execute([$id]);

    api_json(['success' => true, 'message' => 'Pemateri berhasil dihapus']);
}

if ($method === 'PUT' || $action === 'update' || $action === 'put' || (isset($body['id']) && trim((string)$body['id']) !== '' && $method === 'POST')) {
    $id = trim((string)($body['id'] ?? $_GET['id'] ?? ''));
    if ($id !== '') {
        $fields = [];
        $values = [];
        if (array_key_exists('name', $body)) {
            $fields[] = 'name = ?';
            $values[] = (string)$body['name'];
        }
        if (array_key_exists('role', $body)) {
            $fields[] = 'role = ?';
            $values[] = (string)$body['role'];
        }
        if (array_key_exists('category', $body)) {
            $fields[] = 'category = ?';
            $values[] = (string)$body['category'];
        }
        if (array_key_exists('photo', $body)) {
            $fields[] = 'photo = ?';
            $values[] = (string)$body['photo'];
        }
        if (array_key_exists('cv', $body)) {
            $fields[] = 'cv = ?';
            $values[] = (string)$body['cv'];
        }
        if (array_key_exists('color', $body)) {
            $fields[] = 'color = ?';
            $values[] = (string)$body['color'];
        }

        if ($fields) {
            $values[] = $id;
            $stmt = $pdo->prepare('UPDATE speakers SET ' . implode(', ', $fields) . ' WHERE id = ?');
            $stmt->execute($values);
        }

        $stmt = $pdo->prepare("SELECT id, name, role, category, photo, photo_position, cv, color, created_at FROM speakers WHERE id = ?");
        $stmt->execute([$id]);
        $speaker = $stmt->fetch();

        api_json(['success' => true, 'speaker' => $speaker ? api_speaker_row($speaker) : null]);
    }
}

if ($method === 'POST') {
    $name = trim((string)($body['name'] ?? ''));
    $role = trim((string)($body['role'] ?? ''));
    $category = trim((string)($body['category'] ?? 'speaker'));
    $photo = trim((string)($body['photo'] ?? ''));
    $cv = trim((string)($body['cv'] ?? ''));
    $color = trim((string)($body['color'] ?? 'pink'));

    if ($name === '' || $role === '') {
        api_json(['error' => 'Nama dan Peran/Jabatan wajib diisi'], 400);
    }

    $id = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $name));
    $stmt = $pdo->prepare(
        "INSERT INTO speakers (id, name, role, category, photo, cv, color) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([$id, $name, $role, $category, $photo ?: null, $cv ?: null, $color]);

    $stmt = $pdo->prepare("SELECT id, name, role, category, photo, photo_position, cv, color, created_at FROM speakers WHERE id = ?");
    $stmt->execute([$id]);
    $speaker = $stmt->fetch();

    api_json(['success' => true, 'speaker' => $speaker ? api_speaker_row($speaker) : null]);
}

api_json(['error' => 'Method not allowed'], 405);
