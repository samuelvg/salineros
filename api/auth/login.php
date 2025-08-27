<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/songs/bootstrap.php';
allow_cors();
header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { json_response(['error'=>'Método no permitido'], 405); }

$in = json_input();
$pwd = isset($in['password']) ? (string)$in['password'] : '';

$expected = get_admin_password_clear();
if (!$expected) {
  json_response(['ok'=>false,'error'=>'Password no configurada'], 500);
}

if (!hash_equals($expected, $pwd)) {
  json_response(['ok'=>false,'error'=>'Credenciales inválidas'], 401);
}

if (session_status() !== PHP_SESSION_ACTIVE) session_start();
$_SESSION['is_admin'] = true;
json_response(['ok'=>true]);
