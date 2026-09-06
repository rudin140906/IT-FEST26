<?php
declare(strict_types=1);
require_once __DIR__ . '/_common.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    api_json(['error' => 'Method not allowed'], 405);
}

api_require_admin();

if (!isset($_FILES['file'])) {
    api_json(['error' => 'File belum dipilih'], 400);
}

$file = $_FILES['file'];
$type = (string)($_POST['type'] ?? 'image');
$isGuidebook = ($type === 'guidebook');
$maxSize = $isGuidebook ? 30 * 1024 * 1024 : 10 * 1024 * 1024; // 30MB for Guidebook PDF, 10MB for image

if ($file['error'] !== UPLOAD_ERR_OK) {
    switch ($file['error']) {
        case UPLOAD_ERR_INI_SIZE:
            api_json(['error' => 'Ukuran file melebihi batas upload server (upload_max_filesize). Silakan hubungi admin atau sesuaikan php.ini/cPanel.'], 400);
            break;
        case UPLOAD_ERR_FORM_SIZE:
            api_json(['error' => 'Ukuran file melebihi batas maksimum form upload.'], 400);
            break;
        case UPLOAD_ERR_PARTIAL:
            api_json(['error' => 'File hanya terunggah sebagian. Silakan upload ulang.'], 400);
            break;
        case UPLOAD_ERR_NO_FILE:
            api_json(['error' => 'Tidak ada file yang diunggah.'], 400);
            break;
        case UPLOAD_ERR_NO_TMP_DIR:
            api_json(['error' => 'Folder sementara server tidak ditemukan.'], 500);
            break;
        case UPLOAD_ERR_CANT_WRITE:
            api_json(['error' => 'Gagal menulis file ke disk server (periksa izin folder uploads).'], 500);
            break;
        case UPLOAD_ERR_EXTENSION:
            api_json(['error' => 'Upload file dihentikan oleh konfigurasi PHP server.'], 500);
            break;
        default:
            api_json(['error' => 'Gagal mengunggah file (Kode error: ' . $file['error'] . ')'], 500);
    }
}

if ($file['size'] > $maxSize) {
    $limitLabel = $isGuidebook ? '30MB' : '10MB';
    api_json(['error' => "Ukuran file maksimal {$limitLabel}"], 400);
}

$ext = strtolower(pathinfo((string)$file['name'], PATHINFO_EXTENSION));
$mime = '';
if (function_exists('mime_content_type') && !empty($file['tmp_name']) && file_exists($file['tmp_name'])) {
    $detected = @mime_content_type($file['tmp_name']);
    if (is_string($detected)) {
        $mime = strtolower(trim($detected));
    }
}
if ($mime === '' && isset($file['type'])) {
    $mime = strtolower(trim((string)$file['type']));
}

$allowedImages = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml', 'image/gif'];
$allowedPdfMimes = ['application/pdf', 'application/x-pdf', 'application/acrobat', 'applications/vnd.pdf', 'text/pdf', 'application/octet-stream'];

if ($isGuidebook) {
    if (!in_array($mime, $allowedPdfMimes, true) && $ext !== 'pdf') {
        api_json(['error' => 'File guidebook harus berupa PDF (.pdf)'], 400);
    }
    if ($ext === '') {
        $ext = 'pdf';
    }
} else {
    if (!in_array($mime, $allowedImages, true) && !in_array($ext, ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'], true)) {
        api_json(['error' => 'File harus berupa gambar (PNG, SVG, JPG, WEBP, GIF)'], 400);
    }
    if ($ext === '') {
        $ext = 'png';
    }
}

$uploadDir = __DIR__ . '/../uploads' . ($isGuidebook ? '/guidebooks' : '');
if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0775, true);
}
if (!is_dir($uploadDir) || !is_writable($uploadDir)) {
    @chmod($uploadDir, 0775);
}
if (!is_dir($uploadDir) || !is_writable($uploadDir)) {
    api_json(['error' => 'Folder upload tidak memiliki izin tulis. Pastikan folder uploads berizin 755 atau 775 di cPanel.'], 500);
}

$base = strtolower(pathinfo((string)$file['name'], PATHINFO_FILENAME));
$base = preg_replace('/[^a-z0-9]+/i', '_', $base) ?: 'file';
$filename = $base . '_' . time() . '.' . $ext;
$target = $uploadDir . '/' . $filename;

if (!move_uploaded_file($file['tmp_name'], $target)) {
    api_json(['error' => 'Gagal menyimpan file upload ke server'], 500);
}

@chmod($target, 0644);

$config = api_config();
$siteBasePath = rtrim((string)($config['base_path'] ?? '/IT-Fest'), '/');
$publicPath = ($siteBasePath !== '' ? $siteBasePath : '') . '/uploads' . ($isGuidebook ? '/guidebooks' : '') . '/' . $filename;

api_json([
    'success' => true,
    'url' => $publicPath,
    'publicUrl' => $publicPath,
    'apiServedUrl' => $publicPath,
    'directUrl' => '/uploads' . ($isGuidebook ? '/guidebooks' : '') . '/' . $filename,
    'filename' => $filename,
    'isGuidebook' => $isGuidebook,
]);
