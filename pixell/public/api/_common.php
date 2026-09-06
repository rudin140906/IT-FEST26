<?php
declare(strict_types=1);

// Send CORS headers for all API requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

function api_config(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }

    $configFile = __DIR__ . '/config.php';
    $fileConfig = file_exists($configFile) ? (require $configFile) : [];
    if (!is_array($fileConfig)) {
        $fileConfig = [];
    }

    $config = [
        'host' => getenv('DB_HOST') ?: ($fileConfig['host'] ?? 'localhost'),
        'port' => getenv('DB_PORT') ? (int)getenv('DB_PORT') : (int)($fileConfig['port'] ?? 3306),
        'database' => getenv('DB_DATABASE') ?: ($fileConfig['database'] ?? 'hmjmicp_webtipes'),
        'user' => getenv('DB_USER') ?: ($fileConfig['user'] ?? 'hmjmicp_webtipesuser'),
        'password' => getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : ($fileConfig['password'] ?? 'E]cUWLHLr^7UBz*%'),
    ];

    return $config;
}

function api_pdo(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $config = api_config();
    $host = $config['host'] ?? 'localhost';
    $database = $config['database'] ?? 'hmjmicp_webtipes';
    $user = $config['user'] ?? 'hmjmicp_webtipesuser';
    $password = $config['password'] ?? '';
    $port = (int)($config['port'] ?? 3306);

    // List of candidate connections to try (primary config, TCP fallback, local dev fallbacks)
    $candidates = [
        ['host' => $host, 'port' => $port, 'database' => $database, 'user' => $user, 'password' => $password],
    ];

    if ($host === 'localhost') {
        $candidates[] = ['host' => '127.0.0.1', 'port' => $port, 'database' => $database, 'user' => $user, 'password' => $password];
    } else if ($host === '127.0.0.1') {
        $candidates[] = ['host' => 'localhost', 'port' => $port, 'database' => $database, 'user' => $user, 'password' => $password];
    }

    // Local Laragon / XAMPP fallbacks if cPanel credentials are not present locally
    $candidates[] = ['host' => 'localhost', 'port' => 3306, 'database' => $database, 'user' => 'root', 'password' => ''];
    $candidates[] = ['host' => '127.0.0.1', 'port' => 3306, 'database' => $database, 'user' => 'root', 'password' => ''];

    $lastException = null;
    foreach ($candidates as $cand) {
        try {
            $dsn = "mysql:host={$cand['host']};port={$cand['port']};dbname={$cand['database']};charset=utf8mb4";
            $pdo = new PDO($dsn, $cand['user'], $cand['password'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
            api_auto_migrate($pdo);
            return $pdo;
        } catch (PDOException $e) {
            $lastException = $e;
        }
    }

    api_json([
        'error' => 'Koneksi MySQL Gagal: ' . ($lastException ? $lastException->getMessage() : 'Gagal terhubung ke database'),
        'hint' => '1. Pastikan User database cPanel sudah ditambahkan ke Database di cPanel MySQL Databases dan centang ALL PRIVILEGES. 2. Periksa kembali nama database, user, dan password di api/config.php.',
        'diagnostics' => [
            'configured_host' => $host,
            'configured_user' => $user,
            'configured_database' => $database,
        ]
    ], 500);

    exit;
}

function api_json(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function api_request_json(): array
{
    $raw = file_get_contents('php://input');
    $decoded = $raw ? json_decode($raw, true) : null;
    $jsonParams = is_array($decoded) ? $decoded : [];
    return array_merge($_GET, $_POST, $jsonParams);
}

function api_bool($value, bool $default = false): bool
{
    if ($value === null) {
        return $default;
    }
    if (is_bool($value)) {
        return $value;
    }
    if (is_numeric($value)) {
        return (int)$value !== 0;
    }
    $normalized = strtolower(trim((string)$value));
    return in_array($normalized, ['1', 'true', 'yes', 'on'], true);
}

function api_table_has_column(PDO $pdo, string $table, string $column): bool
{
    $stmt = $pdo->prepare("SHOW COLUMNS FROM `$table` LIKE ?");
    $stmt->execute([$column]);
    return (bool)$stmt->fetch();
}

function api_ensure_column(PDO $pdo, string $table, string $column, string $typeDef): void
{
    try {
        if (!api_table_has_column($pdo, $table, $column)) {
            $pdo->exec("ALTER TABLE `$table` ADD COLUMN `$column` $typeDef");
        }
    } catch (Throwable $e) {
        // Silently ignore if column exists or schema variation
    }
}

function api_partner_row(array $row, string $type): array
{
    return [
        'id' => (int)$row['id'],
        'name' => $row['name'],
        'logoUrl' => $row['logo_url'],
        'type' => $type,
        'websiteUrl' => $row['website_url'] ?? null,
        'createdAt' => $row['created_at'] ?? null,
        'isVisible' => isset($row['is_visible']) ? ((int)$row['is_visible'] !== 0) : true,
    ];
}

function api_timeline_row(array $row): array
{
    return [
        'id' => (int)$row['id'],
        'title' => $row['title'],
        'date' => $row['date_string'],
        'category' => $row['category'] ?? null,
        'badgeColor' => $row['badge_color'] ?? 'pink',
        'imageUrl' => $row['image_url'] ?? null,
        'createdAt' => $row['created_at'] ?? null,
    ];
}

function api_event_row(array $row): array
{
    return [
        'id' => $row['id'],
        'title' => $row['title'],
        'category' => $row['category'],
        'categoryLabel' => $row['category_label'],
        'description' => $row['description'] ?? '',
        'iconType' => $row['icon_type'] ?? 'code',
        'badgeColor' => $row['badge_color'] ?? 'cyan',
        'gformUrl' => $row['gform_url'] ?? '',
        'guidebookUrl' => $row['guidebook_url'] ?? '',
        'mascotUrl' => $row['mascot_url'] ?? null,
        'createdAt' => $row['created_at'] ?? null,
    ];
}

function api_speaker_row(array $row): array
{
    return [
        'id' => $row['id'],
        'name' => $row['name'],
        'role' => $row['role'],
        'category' => $row['category'] ?? 'speaker',
        'photo' => $row['photo'] ?? null,
        'photoPosition' => $row['photo_position'] ?? 'center',
        'cv' => $row['cv'] ?? null,
        'color' => $row['color'] ?? 'pink',
        'createdAt' => $row['created_at'] ?? null,
    ];
}

function api_auto_migrate(PDO $pdo): void
{
    static $done = false;
    if ($done) return;
    $done = true;

    // 1. Create tables with individual error isolation
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS sponsors (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            logo_url VARCHAR(500) NOT NULL,
            website_url VARCHAR(500) DEFAULT NULL,
            is_visible TINYINT(1) NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    } catch (Throwable $e) {}

    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS media_partners (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            logo_url VARCHAR(500) NOT NULL,
            website_url VARCHAR(500) DEFAULT NULL,
            is_visible TINYINT(1) NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    } catch (Throwable $e) {}

    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS admin_users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255) DEFAULT 'Admin IT-Festival',
            role VARCHAR(50) DEFAULT 'admin',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    } catch (Throwable $e) {}

    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS timeline (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            date_string VARCHAR(255) NOT NULL,
            category VARCHAR(100) DEFAULT 'AGENDA',
            badge_color VARCHAR(20) DEFAULT 'pink',
            image_url VARCHAR(500) DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    } catch (Throwable $e) {}

    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS events (
            id VARCHAR(100) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            category VARCHAR(50) NOT NULL,
            category_label VARCHAR(100) NOT NULL,
            description TEXT,
            icon_type VARCHAR(50) DEFAULT 'code',
            badge_color VARCHAR(20) DEFAULT 'cyan',
            gform_url VARCHAR(500) DEFAULT 'https://forms.google.com/',
            guidebook_url VARCHAR(500) DEFAULT '',
            mascot_url VARCHAR(500) DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    } catch (Throwable $e) {}

    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS speakers (
            id VARCHAR(100) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            role VARCHAR(255) NOT NULL,
            category VARCHAR(50) NOT NULL DEFAULT 'speaker',
            photo VARCHAR(500) DEFAULT NULL,
            photo_position VARCHAR(100) DEFAULT 'center',
            cv VARCHAR(500) DEFAULT NULL,
            color VARCHAR(20) DEFAULT 'pink',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    } catch (Throwable $e) {}

    // 2. Ensure columns exist on existing tables
    api_ensure_column($pdo, 'sponsors', 'website_url', 'VARCHAR(500) DEFAULT NULL');
    api_ensure_column($pdo, 'sponsors', 'is_visible', 'TINYINT(1) NOT NULL DEFAULT 1');

    api_ensure_column($pdo, 'media_partners', 'website_url', 'VARCHAR(500) DEFAULT NULL');
    api_ensure_column($pdo, 'media_partners', 'is_visible', 'TINYINT(1) NOT NULL DEFAULT 1');

    api_ensure_column($pdo, 'timeline', 'image_url', 'VARCHAR(500) DEFAULT NULL');
    api_ensure_column($pdo, 'events', 'mascot_url', 'VARCHAR(500) DEFAULT NULL');

    // 3. Create OR REPLACE partners VIEW for legacy or combined queries
    try {
        $pdo->exec("CREATE OR REPLACE VIEW partners AS 
            SELECT id, name, logo_url, website_url, is_visible, 'sponsor' AS type, created_at FROM sponsors
            UNION ALL
            SELECT id, name, logo_url, website_url, is_visible, 'media_partner' AS type, created_at FROM media_partners");
    } catch (Throwable $e) {}
}
