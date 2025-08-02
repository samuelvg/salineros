<?php
// ============================================
// Archivo: /intranet3/api/songs/delete.php
// ============================================
header('Content-Type: application/json; charset=utf-8');

// Permitir CORS si es necesario
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");         
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
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

// Incluir configuración de base de datos
try {
    require __DIR__ . '/db.php';
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de configuración de base de datos']);
    exit;
}

try {
    // Verificar que la canción existe
    $stmt = $pdo->prepare('SELECT id, titulo FROM tbl_canciones WHERE id = ?');
    $stmt->execute([$id]);
    $cancion = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$cancion) {
        http_response_code(404);
        echo json_encode(['error' => 'Canción no encontrada']);
        exit;
    }

    // Eliminar la canción
    $stmt = $pdo->prepare('DELETE FROM tbl_canciones WHERE id = ?');
    $result = $stmt->execute([$id]);
    
    if (!$result) {
        throw new Exception('Error al eliminar en la base de datos');
    }
    
    echo json_encode([
        'success' => true, 
        'message' => 'Canción eliminada correctamente',
        'deleted_song' => $cancion
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error de base de datos', 
        'details' => $e->getMessage(),
        'code' => $e->getCode()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error al eliminar canción', 
        'details' => $e->getMessage()
    ]);
}
?>