<?php
// ============================================
// Archivo: /intranet3/api/songs/update.php
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

// Incluir configuración de base de datos
try {
    require __DIR__ . '/db.php';
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de configuración de base de datos']);
    exit;
}

// Leer datos de entrada
$input_raw = file_get_contents('php://input');
if (empty($input_raw)) {
    http_response_code(400);
    echo json_encode(['error' => 'No se recibieron datos']);
    exit;
}

$input = json_decode($input_raw, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'JSON inválido: ' . json_last_error_msg()]);
    exit;
}

// Validar datos requeridos
if (empty($input['titulo']) || empty($input['letra'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Título y letra son obligatorios']);
    exit;
}

try {
    // Verificar que la canción existe
    $stmt = $pdo->prepare('SELECT id FROM tbl_canciones WHERE id = ?');
    $stmt->execute([$id]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Canción no encontrada']);
        exit;
    }

    // Actualizar la canción
    $stmt = $pdo->prepare(
        'UPDATE tbl_canciones SET titulo = ?, letra = ?, acordes = ?, melodia = ?, audios = ?, etiquetas = ?, updated_at = NOW()
         WHERE id = ?'
    );
    
    $result = $stmt->execute([
        trim($input['titulo']),
        isset($input['letra']) ? trim($input['letra']) : '',
        isset($input['acordes']) ? trim($input['acordes']) : '',
        isset($input['melodia']) ? trim($input['melodia']) : '',
        isset($input['audios']) ? trim($input['audios']) : '',
        isset($input['etiquetas']) ? trim($input['etiquetas']) : '',
        $id
    ]);
    
    if (!$result) {
        throw new Exception('Error al actualizar en la base de datos');
    }
    
    // Obtener la canción actualizada
    $stmt = $pdo->prepare(
        'SELECT id, titulo, letra, acordes, melodia, audios, etiquetas, updated_at
         FROM tbl_canciones WHERE id = ?'
    );
    $stmt->execute([$id]);
    $cancion = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$cancion) {
        throw new Exception('Error al recuperar la canción actualizada');
    }
    
    // Asegurar que updated_at esté en formato ISO
    if ($cancion['updated_at']) {
        $cancion['updated_at'] = date('c', strtotime($cancion['updated_at']));
    }
    
    echo json_encode($cancion);
    
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
        'error' => 'Error al actualizar canción', 
        'details' => $e->getMessage()
    ]);
}
?>