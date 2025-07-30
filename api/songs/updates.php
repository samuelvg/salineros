<?php
require __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

$since = $_GET['since'] ?? null;

try {
    if ($since && preg_match('/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}/', $since)) {
        $stmt = $pdo->prepare(
            'SELECT id, titulo, letra, acordes, melodia, audios, etiquetas, updated_at FROM tbl_canciones WHERE updated_at > :since'
        );
        $stmt->execute(['since' => $since]);
    } else {
        $stmt = $pdo->query('SELECT id, titulo, letra, acordes, melodia, audios, etiquetas, updated_at FROM tbl_canciones');
    }
    $items = $stmt->fetchAll();
    echo json_encode(['creadas'=>[],'modificadas'=>$items,'eliminadas'=>[]]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error'=>'Error al obtener actualizaciones','details'=>$e->getMessage()]);
}