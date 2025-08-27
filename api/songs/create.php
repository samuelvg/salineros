<?php
// ============================================
// Archivo: /api/songs/create.php
// ============================================
require_once __DIR__ . '/bootstrap.php';
allow_cors();
require_admin_or_key();

function sanitize_tags($val) {
  if (is_array($val)) {
    $val = array_map('trim', $val);
    $val = array_values(array_filter($val, fn($x)=>$x!==''));
    return implode(',', $val);
  }
  if (is_string($val)) return trim($val);
  return '';
}

$input = $_SERVER['CONTENT_TYPE'] ?? '';
$data = (stripos($input, 'application/json') !== false) ? body_json() : $_POST;

$titulo   = trim($data['titulo'] ?? '');
$letra    = (string)($data['letra'] ?? '');
$acordes  = (string)($data['acordes'] ?? '');
$melodia  = (string)($data['melodia'] ?? '');
$audios   = (string)($data['audios'] ?? '');
$etiquetasIn = $data['etiquetas'] ?? ($data['tags'] ?? ''); // acepta ambos
$etiquetas = sanitize_tags($etiquetasIn);

if ($titulo === '') {
  json_response(['error' => 'El título es requerido'], 400);
}

try {
  $pdo = db();

  // Sanitización básica por lista blanca
  $letra   = sanitize_html($letra,  ['strong','b','em','i','u','br','p','span']);
  $acordes = sanitize_html($acordes,['strong','b','em','i','br','span']);
  $melodia = sanitize_html($melodia,['strong','b','em','i','br','p','span']);
  $audios  = sanitize_html($audios, ['audio','source','video','iframe','a','strong','b','em','i','u','br','p','span']);

  $stmt = $pdo->prepare("INSERT INTO tbl_canciones (titulo, etiquetas, letra, acordes, melodia, audios, created_at) 
                         VALUES (:titulo, :etiquetas, :letra, :acordes, :melodia, :audios, NOW())");
  $stmt->execute([
    ':titulo'    => $titulo,
    ':etiquetas' => $etiquetas,
    ':letra'     => $letra,
    ':acordes'   => $acordes,
    ':melodia'   => $melodia,
    ':audios'    => $audios
  ]);

  $id = (int)$pdo->lastInsertId();
  $row = $pdo->prepare("SELECT * FROM tbl_canciones WHERE id = :id");
  $row->execute([':id' => $id]);
  $c = $row->fetch();

  if (!empty($c['updated_at'])) {
    $c['updated_at'] = date('c', strtotime($c['updated_at']));
  }
  // Exponer tags[] para el frontend
  $c['tags'] = ($etiquetas !== '') ? array_map('trim', explode(',', $etiquetas)) : [];

  json_response($c, 201);
} catch (Throwable $e) {
  if (app_debug()) {
    json_response(['error' => 'Error al crear canción', 'details' => $e->getMessage()], 500);
  }
  json_response(['error' => 'Error de servidor'], 500);
}
