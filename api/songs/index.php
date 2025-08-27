<?php
// ============================================
// Archivo: /api/songs/index.php
// Lista canciones desde tbl_canciones
// ============================================
require_once __DIR__ . '/bootstrap.php';
allow_cors();

function parse_tags($str) {
  if (!is_string($str) || $str === '') return [];
  $parts = preg_split('/[,;]+/', $str);
  $parts = array_map('trim', $parts);
  return array_values(array_filter($parts, fn($x)=>$x!==''));
}

try {
  $pdo = db();
  $stmt = $pdo->query("SELECT * FROM tbl_canciones ORDER BY titulo ASC");
  $rows = $stmt->fetchAll();

  foreach ($rows as &$r) {
    if (!empty($r['updated_at'])) {
      $r['updated_at'] = date('c', strtotime($r['updated_at']));
    }
    // Mantener compatibilidad: exponer tags[] desde etiquetas
    $r['tags'] = parse_tags($r['etiquetas'] ?? '');
  }

  json_response($rows);
} catch (Throwable $e) {
  if (app_debug()) {
    json_response(['error' => 'Error al obtener canciones', 'details' => $e->getMessage()], 500);
  }
  json_response(['error' => 'Error de servidor'], 500);
}
