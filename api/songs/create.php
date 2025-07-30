// ============================================
// Archivo: /intranet3/api/songs/create.php
// ============================================
<?php
require __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (empty($input['titulo']) || empty($input['letra'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

try {
    $stmt = $pdo->prepare(
        'INSERT INTO tbl_canciones (titulo, letra, acordes, melodia, audios, etiquetas, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())'
    );
    $stmt->execute([
        $input['titulo'],
        $input['letra'],
        json_encode($input['acordes'] ?? []),
        $input['melodia'] ?? '',
        json_encode($input['audios'] ?? []),
        $input['etiquetas'] ?? ''
    ]);
    $id = (int)$pdo->lastInsertId();
    $stmt = $pdo->prepare(
        'SELECT id, titulo, letra, acordes, melodia, audios, etiquetas, updated_at
         FROM songs WHERE id = ?'
    );
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al crear canción', 'details' => $e->getMessage()]);
}