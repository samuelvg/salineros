<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../bootstrap.php';

try {
    require_admin_or_key(); // Protect updates

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    $input = json_input();
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON body']);
        exit;
    }

    $id = isset($input['id']) ? (int)$input['id'] : 0;
    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing or invalid id']);
        exit;
    }

    // Fields mapping and sanitization
    $titulo   = isset($input['titulo']) ? trim((string)$input['titulo']) : null;
    $etiquetas= isset($input['etiquetas']) ? trim((string)$input['etiquetas']) : (isset($input['tags']) ? trim((string)$input['tags']) : null);
    $letra    = isset($input['letra']) ? (string)$input['letra'] : null;
    $acordes  = isset($input['acordes']) ? (string)$input['acordes'] : null;
    $melodia  = isset($input['melodia']) ? (string)$input['melodia'] : null;
    $audios   = isset($input['audios']) ? (string)$input['audios'] : null;

    // Apply allowlist sanitization (defined in bootstrap.php)
    if ($letra !== null)   $letra   = sanitize_html_allowlist($letra);
    if ($acordes !== null) $acordes = sanitize_html_allowlist($acordes);
    if ($melodia !== null) $melodia = sanitize_html_allowlist($melodia);
    if ($audios !== null)  $audios  = sanitize_html_allowlist($audios);

    $fields = [];
    $params = [':id' => $id];

    if ($titulo !== null)    { $fields[] = "titulo = :titulo";       $params[':titulo']    = $titulo; }
    if ($etiquetas !== null) { $fields[] = "etiquetas = :etiquetas"; $params[':etiquetas'] = $etiquetas; }
    if ($letra !== null)     { $fields[] = "letra = :letra";         $params[':letra']     = $letra; }
    if ($acordes !== null)   { $fields[] = "acordes = :acordes";     $params[':acordes']   = $acordes; }
    if ($melodia !== null)   { $fields[] = "melodia = :melodia";     $params[':melodia']   = $melodia; }
    if ($audios !== null)    { $fields[] = "audios = :audios";       $params[':audios']    = $audios; }

    if (empty($fields)) {
        http_response_code(400);
        echo json_encode(['error' => 'No fields to update']);
        exit;
    }

    $fields[] = "updated_at = CURRENT_TIMESTAMP()";
    $sql = "UPDATE tbl_canciones SET " . implode(', ', $fields) . " WHERE id = :id";
    $pdo = db();
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    if ($stmt->rowCount() === 0) {
        // Could be not found or identical content
        // Try to fetch to confirm existence
        $check = $pdo->prepare("SELECT id FROM tbl_canciones WHERE id=:id");
        $check->execute([':id'=>$id]);
        if (!$check->fetch()) {
            http_response_code(404);
            echo json_encode(['error' => 'Song not found']);
            exit;
        }
    }

    // Return updated record
    $q = $pdo->prepare("SELECT id, titulo, etiquetas, letra, acordes, melodia, audios, created_at, updated_at FROM tbl_canciones WHERE id = :id");
    $q->execute([':id' => $id]);
    $row = $q->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to load updated record']);
        exit;
    }

    // Normalize timestamps to ISO8601
    if (isset($row['created_at'])) $row['created_at'] = date(DATE_ATOM, strtotime($row['created_at']));
    if (isset($row['updated_at'])) $row['updated_at'] = date(DATE_ATOM, strtotime($row['updated_at']));

    // Also return tags array for convenience
    $row['tags'] = [];
    if (!empty($row['etiquetas'])) {
        $tags = array_filter(array_map('trim', preg_split('/[;,]/', (string)$row['etiquetas'])));
        $row['tags'] = array_values($tags);
    }

    echo json_encode(['ok' => true, 'song' => $row], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'details' => $e->getMessage()]);
}
