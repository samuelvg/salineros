// ============================================
// Archivo: /intranet3/api/songs/update.php
// ============================================
<?php
require __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'ID inválido']);
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
        'UPDATE tbl_canciones SET titulo = ?, letra = ?, acordes = ?, melodia = ?, audios = ?, etiquetas = ?, updated_at = NOW()
         WHERE id = ?'
    );
    $stmt->execute([
        $input['titulo'],
        $input['letra'],
        json_encode($input['acordes'] ?? []),
        $input['melodia'] ?? '',
        json_encode($input['audios'] ?? []),
        $input['etiquetas'] ?? '',
        $id
    ]);
    $stmt = $pdo->prepare(
        'SELECT id, titulo, letra, acordes, melodia, audios, etiquetas, updated_at
         FROM tbl_canciones WHERE id = ?'
    );
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch());
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al actualizar canción', 'details' => $e->getMessage()]);
}
