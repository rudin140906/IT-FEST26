<?php
echo "========================================================\n";
echo "🛠️ IMPORT DATABASE IT FESTIVAL KE LARAGON MYSQL\n";
echo "========================================================\n\n";

try {
    $host = '127.0.0.1';
    $port = '3306';
    $username = 'root';
    $password = '';

    echo "1. Menghubungkan ke MySQL ($host:$port)...\n";
    $pdo = new PDO("mysql:host=$host;port=$port", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "2. Memastikan database 'it_festival' tersedia...\n";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `it_festival` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    $pdo->exec("USE `it_festival`;");

    echo "3. Mengimpor tabel & data (sponsors & media_partners) dari schema.sql...\n";
    $sqlFile = __DIR__ . '/schema.sql';
    if (!file_exists($sqlFile)) {
        throw new Exception("File schema.sql tidak ditemukan di " . $sqlFile);
    }
    $sql = file_get_contents($sqlFile);
    $pdo->exec($sql);

    echo "\n🎉 BERHASIL! Tabel 'sponsors' dan 'media_partners' terpisah sukses diimpor ke Laragon MySQL!\n";
} catch (Exception $e) {
    echo "\n❌ GAGAL: " . $e->getMessage() . "\n";
    echo "💡 Petunjuk: Pastikan Service MySQL di Laragon sudah dalam kondisi STARTED / ON.\n";
}
