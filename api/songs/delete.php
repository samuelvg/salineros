<?php
// ============================================
// Archivo: /api/songs/delete.php
// ============================================
require_once __DIR__ . '/bootstrap.php';
allow_cors();
require_admin_or_key();

$input = $_SERVER['CONTENT_TYPE'] ?? '';
$data = (stripos($input, 'application/json') !== false) ? body_json() : $_POST;

$id = isset($data['id']) ? (int)$data['id'] : 0;
if ($id <= 0) {
  json_response(['error' => 'ID inválido'], 400);
}

try {
  $pdo = db();
  $del = $pdo->prepare("DELETE FROM tbl_canciones WHERE id = :id");
  $del->execute([':id' => $id]);

  json_response(['ok' => true, 'deleted_id' => $id]);
} catch (Throwable $e) {
  if (app_debug()) {
    json_response(['error' => 'Error al eliminar canción', 'details' => $e->getMessage()], 500);
  }
  json_response(['error' => 'Error de servidor'], 500);
}
