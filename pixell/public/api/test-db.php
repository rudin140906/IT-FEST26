<?php
ini_set('display_errors', '1');
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    echo json_encode([
        'success' => false,
        'error' => 'Berkas api/config.php tidak ditemukan di server cPanel.',
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$config = require $configFile;
$host = $config['host'] ?? 'localhost';
$user = $config['user'] ?? '';
$password = $config['password'] ?? '';
$database = $config['database'] ?? '';
$port = (int)($config['port'] ?? 3306);

try {
    $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    $stmt = $pdo->query("SELECT DATABASE() as db, VERSION() as ver");
    $dbInfo = $stmt->fetch(PDO::FETCH_ASSOC);

    // List of tables to check
    $targetTables = ['admin_users', 'events', 'speakers', 'sponsors', 'timeline', 'media_partners', 'partners'];
    $tableCounts = [];

    foreach ($targetTables as $tbl) {
        try {
            $cStmt = $pdo->query("SELECT COUNT(*) as cnt FROM `$tbl`");
            $cRow = $cStmt->fetch(PDO::FETCH_ASSOC);
            $tableCounts[$tbl] = [
                'status' => 'ADA',
                'total_records' => (int)($cRow['cnt'] ?? 0)
            ];
        } catch (Exception $e) {
            $tableCounts[$tbl] = [
                'status' => 'BELUM_ADA',
                'error' => 'Tabel tidak ditemukan'
            ];
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Koneksi Database MySQL cPanel 100% SUKSES!',
        'server' => [
            'database' => $dbInfo['db'] ?? $database,
            'mysql_version' => $dbInfo['ver'] ?? 'OK',
            'host' => $host,
            'user' => $user,
        ],
        'tables_status' => $tableCounts,
        'api_endpoints_test' => [
            'test_db' => '/IT-Fest/api/test-db.php',
            'events_api' => '/IT-Fest/api/events.php',
            'timeline_api' => '/IT-Fest/api/timeline.php',
            'sponsors_api' => '/IT-Fest/api/sponsors.php',
            'media_partners_api' => '/IT-Fest/api/media-partners.php',
            'speakers_api' => '/IT-Fest/api/speakers.php',
            'admin_check_session' => '/IT-Fest/api/admin/check.php',
            'admin_login' => '/IT-Fest/api/admin/login.php',
        ]
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

} catch (PDOException $e) {
    if ($host === 'localhost') {
        try {
            $dsnTcp = "mysql:host=127.0.0.1;port={$port};dbname={$database};charset=utf8mb4";
            $pdoTcp = new PDO($dsnTcp, $user, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            ]);
            $stmt = $pdoTcp->query("SELECT DATABASE() as db, VERSION() as ver");
            $dbInfo = $stmt->fetch(PDO::FETCH_ASSOC);

            $targetTables = ['admin_users', 'events', 'speakers', 'sponsors', 'timeline', 'media_partners', 'partners'];
            $tableCounts = [];

            foreach ($targetTables as $tbl) {
                try {
                    $cStmt = $pdoTcp->query("SELECT COUNT(*) as cnt FROM `$tbl`");
                    $cRow = $cStmt->fetch(PDO::FETCH_ASSOC);
                    $tableCounts[$tbl] = [
                        'status' => 'ADA',
                        'total_records' => (int)($cRow['cnt'] ?? 0)
                    ];
                } catch (Exception $e) {
                    $tableCounts[$tbl] = [
                        'status' => 'BELUM_ADA',
                        'error' => 'Tabel tidak ditemukan'
                    ];
                }
            }

            echo json_encode([
                'success' => true,
                'message' => 'Koneksi Database MySQL cPanel 100% SUKSES (via TCP 127.0.0.1)!',
                'server' => [
                    'database' => $dbInfo['db'] ?? $database,
                    'mysql_version' => $dbInfo['ver'] ?? 'OK',
                    'host' => '127.0.0.1',
                    'user' => $user,
                ],
                'tables_status' => $tableCounts,
                'api_endpoints_test' => [
                    'test_db' => '/IT-Fest/api/test-db.php',
                    'events_api' => '/IT-Fest/api/events.php',
                    'timeline_api' => '/IT-Fest/api/timeline.php',
                    'sponsors_api' => '/IT-Fest/api/sponsors.php',
                    'media_partners_api' => '/IT-Fest/api/media-partners.php',
                    'speakers_api' => '/IT-Fest/api/speakers.php',
                    'admin_check_session' => '/IT-Fest/api/admin/check.php',
                    'admin_login' => '/IT-Fest/api/admin/login.php',
                ]
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            exit;
        } catch (PDOException $e2) {
            echo json_encode([
                'success' => false,
                'error' => 'Koneksi MySQL Gagal: ' . $e2->getMessage(),
                'hint' => 'Pastikan User ' . $user . ' sudah ditambahkan ke Database ' . $database . ' di cPanel MySQL Databases dan centang ALL PRIVILEGES.',
                'localhost_error' => $e->getMessage(),
                'tcp_error' => $e2->getMessage(),
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            exit;
        }
    }

    echo json_encode([
        'success' => false,
        'error' => 'Koneksi MySQL Gagal: ' . $e->getMessage(),
        'hint' => 'Pastikan User ' . $user . ' sudah ditambahkan ke Database ' . $database . ' di cPanel MySQL Databases dan centang ALL PRIVILEGES.',
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}
