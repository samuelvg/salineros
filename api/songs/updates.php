<?php
// ============================================
// Archivo: /api/songs/updates.php
// Devuelve canciones modificadas desde una fecha ISO
// ============================================
require_once __DIR__ . '/bootstrap.php';
allow_cors();

function parse_tags($str) {
  if (!is_string($str) || $str === '') return [];
  $parts = preg_split('/[,;]+/', $str);
  $parts = array_map('trim', $parts);
  return array_values(array_filter($parts, fn($x)=>$x!==''));
}

$since = $_GET['since'] ?? '';
$sinceTs = strtotime($since);
if (!$since || $sinceTs === false) {
  json_response(['error' => 'Parámetro "since" (ISO 8601) requerido'], 400);
}

try {
  $pdo = db();
  $stmt = $pdo->prepare("SELECT * FROM tbl_canciones WHERE updated_at >= :since ORDER BY updated_at ASC");
  $stmt->execute([':since' => date('Y-m-d H:i:s', $sinceTs)]);
  $rows = $stmt->fetchAll();

  foreach ($rows as &$r) {
    if (!empty($r['updated_at'])) {
      $r['updated_at'] = date('c', strtotime($r['updated_at']));
    }
    $r['tags'] = parse_tags($r['etiquetas'] ?? '');
  }

  json_response($rows);
} catch (Throwable $e) {
  if (app_debug()) {
    json_response(['error' => 'Error al obtener actualizaciones', 'details' => $e->getMessage()], 500);
  }
  json_response(['error' => 'Error de servidor'], 500);
}
