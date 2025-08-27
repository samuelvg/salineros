<?php
// ============================================
// Archivo: /api/songs/db.php (delegado a bootstrap.php)
// ============================================
require_once __DIR__ . '/bootstrap.php';

// Exporta una función de ayuda para obtener el PDO, por compatibilidad
function get_pdo(): PDO {
  return db();
}
