<?php
declare(strict_types=1);
require_once __DIR__ . '/_common.php';

$pdo = api_pdo();

function fetch_partners(PDO $pdo, bool $includeHidden = false): array
{
    $sponsorRows = $pdo->query(
        "SELECT id, name, logo_url, website_url, created_at, is_visible FROM sponsors ORDER BY id DESC"
    )->fetchAll() ?: [];
    $mediaRows = $pdo->query(
        "SELECT id, name, logo_url, website_url, created_at, is_visible FROM media_partners ORDER BY id DESC"
    )->fetchAll() ?: [];

    $sponsors = array_map(fn($row) => api_partner_row($row, 'sponsor'), $sponsorRows);
    $mediaPartners = array_map(fn($row) => api_partner_row($row, 'media_partner'), $mediaRows);
    $all = array_merge($sponsors, $mediaPartners);

    if (!$includeHidden) {
        $all = array_values(array_filter($all, fn($item) => !empty($item['isVisible'])));
        $sponsors = array_values(array_filter($sponsors, fn($item) => !empty($item['isVisible'])));
        $mediaPartners = array_values(array_filter($mediaPartners, fn($item) => !empty($item['isVisible'])));
    }

    return [
        'all' => $all,
        'sponsors' => $sponsors,
        'mediaPartners' => $mediaPartners,
        'source' => 'mysql',
    ];
}

function upsert_partner(PDO $pdo, string $type, array $body): array
{
    $table = $type === 'media_partner' ? 'media_partners' : 'sponsors';
    $logoKey = $body['logoUrl'] ?? null;
    if (!isset($body['name'], $logoKey)) {
        api_json(['error' => 'Nama dan Logo URL wajib diisi'], 400);
    }

    $isVisible = api_bool($body['isVisible'] ?? true, true) ? 1 : 0;
    $websiteUrl = trim((string)($body['websiteUrl'] ?? '')) ?: null;

    $stmt = $pdo->prepare("INSERT INTO `$table` (name, logo_url, website_url, is_visible) VALUES (?, ?, ?, ?)");
    $stmt->execute([trim((string)$body['name']), trim((string)$body['logoUrl']), $websiteUrl, $isVisible]);
    $id = (int)$pdo->lastInsertId();

    $stmt = $pdo->prepare("SELECT id, name, logo_url, website_url, created_at, is_visible FROM `$table` WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();

    return $row ? api_partner_row($row, $type) : [];
}

function update_partner(PDO $pdo, string $table, int $id, array $body, string $type): ?array
{
    api_ensure_column($pdo, $table, 'website_url', 'VARCHAR(500) DEFAULT NULL');
    api_ensure_column($pdo, $table, 'is_visible', 'TINYINT(1) NOT NULL DEFAULT 1');

    $fields = [];
    $values = [];
    if (array_key_exists('name', $body)) { $fields[] = 'name = ?'; $values[] = trim((string)$body['name']); }
    if (array_key_exists('logoUrl', $body)) { $fields[] = 'logo_url = ?'; $values[] = trim((string)$body['logoUrl']); }
    if (array_key_exists('websiteUrl', $body)) { $fields[] = 'website_url = ?'; $values[] = trim((string)$body['websiteUrl']) ?: null; }
    if (array_key_exists('isVisible', $body)) { $fields[] = 'is_visible = ?'; $values[] = api_bool($body['isVisible']) ? 1 : 0; }

    if (!$fields) {
        $stmt = $pdo->prepare("SELECT id, name, logo_url, website_url, created_at, is_visible FROM `$table` WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ? api_partner_row($row, $type) : null;
    }

    $values[] = $id;
    $stmt = $pdo->prepare("UPDATE `$table` SET " . implode(', ', $fields) . " WHERE id = ?");
    $stmt->execute($values);

    $stmt = $pdo->prepare("SELECT id, name, logo_url, website_url, created_at, is_visible FROM `$table` WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    return $row ? api_partner_row($row, $type) : null;
}

function delete_partner(PDO $pdo, string $table, int $id): bool
{
    $stmt = $pdo->prepare("DELETE FROM `$table` WHERE id = ?");
    $stmt->execute([$id]);
    return true;
}

$method = $_SERVER['REQUEST_METHOD'];
$body = api_request_json();
$action = strtolower((string)($body['action'] ?? $_GET['action'] ?? $body['_method'] ?? $_GET['_method'] ?? ''));

// Handle GET
if ($method === 'GET') {
    $includeHidden = api_bool($_GET['includeHidden'] ?? false, false);
    api_json(fetch_partners($pdo, $includeHidden));
}

// Handle DELETE
if ($method === 'DELETE' || $action === 'delete') {
    $id = (int)($_GET['id'] ?? $body['id'] ?? 0);
    $rawType = strtolower(trim((string)($_GET['type'] ?? $body['type'] ?? '')));
    if (!$id) {
        api_json(['error' => 'ID partner wajib disertakan'], 400);
    }

    if (in_array($rawType, ['sponsor', 'sponsors'], true)) {
        delete_partner($pdo, 'sponsors', $id);
        api_json(['success' => true, 'message' => 'Sponsor berhasil dihapus']);
    }
    if (in_array($rawType, ['media_partner', 'media_partners', 'media-partner', 'mediapartner'], true)) {
        delete_partner($pdo, 'media_partners', $id);
        api_json(['success' => true, 'message' => 'Media partner berhasil dihapus']);
    }

    delete_partner($pdo, 'sponsors', $id);
    delete_partner($pdo, 'media_partners', $id);
    api_json(['success' => true, 'message' => 'Partner berhasil dihapus']);
}

// Handle UPDATE (PUT or POST with action=update or POST with id present for editing)
if ($method === 'PUT' || $action === 'update' || $action === 'put' || ($method === 'POST' && isset($body['id']) && (int)$body['id'] > 0 && $action !== 'create')) {
    $id = (int)($body['id'] ?? $_GET['id'] ?? 0);
    $rawType = strtolower(trim((string)($body['type'] ?? $_GET['type'] ?? '')));

    if ($id <= 0) {
        api_json(['error' => 'ID partner tidak valid'], 400);
    }

    if (in_array($rawType, ['sponsor', 'sponsors'], true)) {
        $partner = update_partner($pdo, 'sponsors', $id, $body, 'sponsor');
        api_json(['success' => true, 'partner' => $partner ?: []]);
    }
    if (in_array($rawType, ['media_partner', 'media_partners', 'media-partner', 'mediapartner'], true)) {
        $partner = update_partner($pdo, 'media_partners', $id, $body, 'media_partner');
        api_json(['success' => true, 'partner' => $partner ?: []]);
    }

    $partner = update_partner($pdo, 'sponsors', $id, $body, 'sponsor');
    if ($partner) api_json(['success' => true, 'partner' => $partner]);

    $partner = update_partner($pdo, 'media_partners', $id, $body, 'media_partner');
    if ($partner) api_json(['success' => true, 'partner' => $partner]);

    api_json(['success' => true, 'message' => 'Partner updated']);
}

// Handle CREATE (POST)
if ($method === 'POST') {
    $rawType = strtolower(trim((string)($body['type'] ?? '')));
    $type = in_array($rawType, ['media_partner', 'media_partners', 'media-partner', 'mediapartner'], true) ? 'media_partner' : 'sponsor';

    $partner = upsert_partner($pdo, $type, $body);
    api_json(['success' => true, 'partner' => $partner], 201);
}

api_json(['error' => 'Method not allowed'], 405);
