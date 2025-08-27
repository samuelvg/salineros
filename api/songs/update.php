<?php
declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

allow_cors();
require_admin_or_key();

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$DEBUG = function_exists('app_debug') ? app_debug() : (
  (isset($_GET['debug']) && $_GET['debug'] === '1') ||
  (getenv('APP_DEBUG') === 'true')
);

/**
 * Respuesta JSON con código de estado
 */
function respond(int $code, array $payload): void {
  http_response_code($code);
  echo json_encode($payload, JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(405, ['ok' => false, 'error' => 'Method not allowed']);
  }

  // Lee el cuerpo JSON usando la utilidad común si existe
  if (function_exists('body_json')) {
    $input = body_json();
  } else {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw, true);
  }

  if (!is_array($input)) {
    respond(400, ['ok' => false, 'error' => 'JSON inválido']);
  }

  // ID obligatorio
  $id = $input['id'] ?? null;
  if ($id === null || $id === '' || !is_numeric($id)) {
    respond(400, ['ok' => false, 'error' => 'ID de canción inválido o ausente']);
  }
  $id = (int)$id;

  // Conexión PDO común
  $pdo = function_exists('db') ? db() : null;
  if (!$pdo instanceof PDO) {
    respond(500, ['ok' => false, 'error' => 'No se pudo obtener la conexión a la base de datos']);
  }
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  $table = 'tbl_canciones';

  // Obtenemos columnas reales de la tabla para whitelistear campos del JSON
  $stmtCols = $pdo->query("DESCRIBE {$table}");
  $columnsInfo = $stmtCols->fetchAll(PDO::FETCH_ASSOC);
  if (!$columnsInfo) {
    respond(500, ['ok' => false, 'error' => 'No se pudieron obtener las columnas de la tabla']);
  }

  $columns = array_map(fn($c) => $c['Field'], $columnsInfo);
  $hasUpdatedAt = in_array('updated_at', $columns, true);

  // Campos que NUNCA se actualizan vía update normal
  $neverUpdate = ['id', 'created_at'];

  // Construimos SET dinámico a partir del input filtrado
  $fields = [];
  $params = [':id' => $id];

  foreach ($input as $key => $value) {
    if ($key === 'id') continue; // ya en WHERE
    if (!in_array($key, $columns, true)) continue; // ignora campos desconocidos
    if (in_array($key, $neverUpdate, true)) continue;

    // Normalización ligera: si viene un array (p.ej. etiquetas), conviértelo a CSV
    if (is_array($value)) {
      $value = implode(',', array_map('strval', $value));
    }

    $fields[] = "`$key` = :$key";
    $params[":$key"] = $value;
  }

  // Si no hay ningún campo a actualizar, salimos con 400
  if (empty($fields) && !$hasUpdatedAt) {
    respond(400, ['ok' => false, 'error' => 'No hay cambios válidos para actualizar']);
  }

  // Añadimos updated_at solo si existe la columna
  if ($hasUpdatedAt) {
    $fields[] = "updated_at = NOW()";
  }

  // Ejecutamos UPDATE
  $sql = "UPDATE {$table} SET " . implode(', ', $fields) . " WHERE id = :id";
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);

  // Volvemos a leer la fila actualizada
  $q = $pdo->prepare("SELECT * FROM {$table} WHERE id = :id LIMIT 1");
  $q->execute([':id' => $id]);
  $row = $q->fetch(PDO::FETCH_ASSOC);

  if (!$row) {
    // Si no existe, probablemente id inválido
    respond(404, ['ok' => false, 'error' => 'Canción no encontrada tras actualizar']);
  }

  respond(200, [
    'ok' => true,
    'song' => $row,
    'debug' => $DEBUG ? [
      'updated_fields' => array_keys($input),
      'applied_fields' => $fields,
    ] : null
  ]);

} catch (PDOException $e) {
  if ($DEBUG) {
    respond(500, ['ok' => false, 'error' => 'DB_ERROR', 'detail' => $e->getMessage()]);
  }
  respond(500, ['ok' => false, 'error' => 'Error de base de datos']);
} catch (Throwable $e) {
  if ($DEBUG) {
    respond(500, ['ok' => false, 'error' => 'SERVER_ERROR', 'detail' => $e->getMessage()]);
  }
  respond(500, ['ok' => false, 'error' => 'Error interno del servidor']);
}
