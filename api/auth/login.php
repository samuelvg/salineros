<?php
declare(strict_types=1);
if (session_status() === PHP_SESSION_NONE) { session_start(); }
require_once __DIR__ . '/../songs/bootstrap.php';
allow_cors();

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
  http_response_code(204); exit;
}

$data = json_input();
$pass = isset($data['password']) ? (string)$data['password'] : '';
if ($pass === '') {
  json_response(['ok'=>false,'error'=>'Password requerida'], 400);
}

$expected = get_admin_password_clear();
if (!$expected) {
  json_response(['ok'=>false,'error'=>'Password no configurada'], 500);
}

if (!hash_equals($expected, $pass)) {
  json_response(['ok'=>false,'error'=>'Credenciales inválidas'], 401);
}

// Login OK: activa sesión admin
$_SESSION['is_admin'] = true;
json_response(['ok'=>true]);
