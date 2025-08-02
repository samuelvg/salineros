<?php
// ============================================
// Archivo: /intranet3/api/songs/create.php
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

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Incluir configuración de base de datos
try {
    require __DIR__ . '/db.php';
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de configuración de base de datos', 'details' => $e->getMessage()]);
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
    $stmt = $pdo->prepare(
        'INSERT INTO tbl_canciones (titulo, letra, acordes, melodia, audios, etiquetas, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())'
    );
    
    $result = $stmt->execute([
        trim($input['titulo']),
        trim($input['letra']),
        isset($input['acordes']) ? trim($input['acordes']) : '',
        isset($input['melodia']) ? trim($input['melodia']) : '',
        isset($input['audios']) ? trim($input['audios']) : '',
        isset($input['etiquetas']) ? trim($input['etiquetas']) : ''
    ]);
    
    if (!$result) {
        throw new Exception('Error al insertar en la base de datos');
    }
    
    $id = $pdo->lastInsertId();
    
    // Devolver la canción recién creada
    $stmt = $pdo->prepare(
        'SELECT id, titulo, letra, acordes, melodia, audios, etiquetas, updated_at
         FROM tbl_canciones WHERE id = ?'
    );
    $stmt->execute([$id]);
    $cancion = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$cancion) {
        throw new Exception('Error al recuperar la canción creada');
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
        'error' => 'Error al crear canción', 
        'details' => $e->getMessage()
    ]);
}
?>