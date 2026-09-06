<?php
declare(strict_types=1);
require_once __DIR__ . '/../_common.php';

$sessionCookie = $_COOKIE['admin_session'] ?? $_GET['session'] ?? '';
if ($sessionCookie === 'authenticated') {
    api_json(['authenticated' => true]);
}

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
if (str_contains(strtolower($authHeader), 'authenticated')) {
    api_json(['authenticated' => true]);
}

api_json(['authenticated' => false], 200);
