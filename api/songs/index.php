<?php
// ============================================
// Archivo: /intranet3/api/songs/index.php
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

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
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
    $stmt = $pdo->prepare('SELECT id, titulo, letra, acordes, melodia, audios, etiquetas, updated_at FROM tbl_canciones ORDER BY titulo ASC');
    $stmt->execute();
    $canciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Convertir timestamps a formato ISO
    foreach ($canciones as &$cancion) {
        if ($cancion['updated_at']) {
            $cancion['updated_at'] = date('c', strtotime($cancion['updated_at']));
        }
    }
    
    echo json_encode($canciones);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error de base de datos', 
        'details' => $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Error al obtener canciones', 
        'details' => $e->getMessage()
    ]);
}
?>