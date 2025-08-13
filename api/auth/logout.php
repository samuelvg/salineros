<?php
declare(strict_types=1);
require_once __DIR__ . '/../songs/bootstrap.php';
allow_cors();
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }

if (session_status() === PHP_SESSION_ACTIVE) {
  $_SESSION = [];
  if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'] ?? false, $params['httponly'] ?? true);
  }
  session_destroy();
}
json_response(['ok'=>true]);
