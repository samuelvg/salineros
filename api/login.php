<?php
declare(strict_types=1);
require_once __DIR__ . '/songs/bootstrap.php';
allow_cors();

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($method === 'OPTIONS') { http_response_code(204); exit; }
if ($method !== 'POST') { json_response(['error' => 'Método no permitido'], 405); }

$body = file_get_contents('php://input');
$data = json_decode($body, true);
$pwd = is_array($data) && isset($data['password']) ? (string)$data['password'] : '';

$stored_b64 = (string)env('ADMIN_PASSWORD_BASE64', '');
if (!$stored_b64) {
  json_response(['error' => 'No configurado'], 500);
}
$stored = base64_decode($stored_b64, true);
if ($stored === false) {
  json_response(['error' => 'Config inválida'], 500);
}

if (hash_equals($stored, $pwd)) {
  if (session_status() !== PHP_SESSION_ACTIVE) { session_start(); }
  $_SESSION['is_admin'] = true;
  json_response(['ok' => true]);
} else {
  json_response(['error' => 'Credenciales inválidas'], 401);
}
