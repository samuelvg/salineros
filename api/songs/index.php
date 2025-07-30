<?php
require __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

try {
    $stmt = $pdo->query('SELECT id, titulo, letra, acordes, melodia, audios, etiquetas, updated_at FROM tbl_canciones');
    $canciones = $stmt->fetchAll();
    echo json_encode($canciones);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener canciones', 'details' => $e->getMessage()]);
}