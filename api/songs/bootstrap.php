<?php
// ============================================
// Archivo: /api/songs/bootstrap.php
// Utilidades comunes: .env, CORS, Auth, Sanitización, DB
// ============================================

declare(strict_types=1);
if (session_status() !== PHP_SESSION_ACTIVE) { session_start(); }

// ------- Helpers de entorno
function env(string $key, $default = null) {
  $val = getenv($key);
  if ($val === false) return $default;
  return $val;
}
function app_is_prod(): bool {
  return strtolower((string)env('APP_ENV', 'production')) === 'production';
}
function app_debug(): bool {
  // Detalles de error si APP_ENV != production o si ?debug=1
  if (!app_is_prod()) return true;
  return (isset($_GET['debug']) && $_GET['debug'] === '1');
}

// ------- Cargar .env (si existe) desde ubicaciones típicas
function loadDotEnv(): void {
  $paths = [
    __DIR__ . '/.env',
    dirname(__DIR__) . '/.env',
    dirname(__DIR__, 2) . '/.env',
  ];
  foreach ($paths as $p) {
    if (!is_file($p)) continue;
    $lines = file($p, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
      $line = trim($line);
      if ($line === '' || $line[0] === '#') continue;
      if (!str_contains($line, '=')) continue;
      [$k, $v] = array_map('trim', explode('=', $line, 2));
      $v = trim($v, "\"'");
      putenv("$k=$v");
      $_ENV[$k] = $v;
      $_SERVER[$k] = $v;
    }
    break;
  }
}
loadDotEnv();

// ------- Respuestas / CORS / Auth
function json_response($data, int $status = 200): void {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}

function allow_cors(): void {
  $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
  $allowed = array_filter(array_map('trim', explode(',', (string)env('ALLOWED_ORIGINS', ''))));
  if ($origin && in_array($origin, $allowed, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
  } else {
    // origen por defecto (ajusta si quieres bloquear)
    header("Access-Control-Allow-Origin: https://www.afsalineros.es");
  }
  header('Vary: Origin');

  if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    header('Access-Control-Max-Age: 86400');
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
      header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    }
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
      header('Access-Control-Allow-Headers: Content-Type, X-API-KEY');
    }
    http_response_code(204);
    exit;
  }
}

function require_api_key(): void {
  $provided = $_SERVER['HTTP_X_API_KEY'] ?? '';
  $expected = (string)env('API_KEY', '');
  if (!$expected || !hash_equals($expected, $provided)) {
    json_response(['error' => 'No autorizado'], 401);
  }
}

function is_admin_session(): bool {
  if (session_status() !== PHP_SESSION_ACTIVE) { @session_start(); }
  return !empty($_SESSION['is_admin']);
}

function require_admin_or_key(): void {
  $provided = $_SERVER['HTTP_X_API_KEY'] ?? '';
  $expected = (string)env('API_KEY', '');
  if ($expected && hash_equals($expected, $provided)) return;
  if (is_admin_session()) return;
  json_response(['error' => 'No autorizado'], 401);
}


// ------- Sanitización y utilidades
function sanitize_html(string $html, array $allowedTags): string {
  $html = preg_replace('/on\w+\s*=\s*"[^"]*"/i', '', $html);
  $html = preg_replace("/on\w+\s*=\s*'[^']*'/i", '', $html);
  $html = preg_replace('/javascript\s*:/i', '', $html);
  $allowed = $allowedTags ? '<' . implode('><', array_map('strtolower', $allowedTags)) . '>' : '';
  return strip_tags($html, $allowed);
}

function body_json(): array {
  $raw = file_get_contents('php://input') ?: '';
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

// ------- Conexión a BD (forzando TCP salvo que indiques SOCKET)
function db(): PDO {
  static $pdo = null;
  if ($pdo) return $pdo;

  $host   = (string)env('DB_HOST', '127.0.0.1'); // evita 'localhost' para no forzar socket
  $port   = (string)env('DB_PORT', '3306');
  $dbname = (string)env('DB_NAME', '');
  $user   = (string)env('DB_USER', '');
  $pass   = (string)env('DB_PASS', '');
  $sock   = (string)env('DB_SOCKET', '');        // si lo indicas, se usará socket

  // Si alguien puso 'localhost', fuerzo TCP:
  if ($host === 'localhost') $host = '127.0.0.1';

  try {
    if ($sock) {
      // Conexión por socket UNIX explícito
      $dsn = "mysql:unix_socket=$sock;dbname=$dbname;charset=utf8mb4";
    } else {
      // Conexión por TCP
      $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
    }

    // Pista de depuración (no expone credenciales)
    if (app_debug()) {
      $mode = $sock ? "socket=$sock" : "tcp=$host:$port";
      header('X-DB-Conn-Mode: '.$mode);
    }

    $pdo = new PDO($dsn, $user, $pass, [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
  } catch (PDOException $e) {
    if (app_debug()) {
      json_response(['error' => 'Error de conexión', 'details' => $e->getMessage()], 500);
    }
    json_response(['error' => 'Error de servidor'], 500);
  }
  return $pdo;
}
