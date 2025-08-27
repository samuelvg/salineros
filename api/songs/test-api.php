<?php
// ============================================
// Archivo: /api/songs/test-api.php
// ============================================
header('Content-Type: application/json; charset=utf-8');

echo "<h1>Test API de Canciones</h1>";

// 1. Probar conexión a base de datos
echo "<h2>1. Probando conexión a base de datos...</h2>";
try {
    require __DIR__ . '/db.php';
    echo "<p style='color: green;'>✓ Conexión a base de datos exitosa</p>";
    
    // Mostrar información de la tabla
    $stmt = $pdo->query("DESCRIBE tbl_canciones");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<h3>Estructura de la tabla:</h3>";
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>Campo</th><th>Tipo</th><th>Nulo</th><th>Clave</th><th>Default</th></tr>";
    foreach ($columns as $col) {
        echo "<tr>";
        echo "<td>{$col['Field']}</td>";
        echo "<td>{$col['Type']}</td>";
        echo "<td>{$col['Null']}</td>";
        echo "<td>{$col['Key']}</td>";
        echo "<td>{$col['Default']}</td>";
        echo "</tr>";
    }
    echo "</table>";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Error de conexión: " . $e->getMessage() . "</p>";
    echo "<p>Verifica la configuración en db.php</p>";
    exit;
}

// 2. Probar inserción de datos
echo "<h2>2. Probando inserción de datos...</h2>";
try {
    $stmt = $pdo->prepare(
        'INSERT INTO tbl_canciones (titulo, letra, acordes, melodia, audios, etiquetas, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())'
    );
    
    $resultado = $stmt->execute([
        'Canción de Prueba',
        'Esta es una letra de prueba\ncon múltiples líneas',
        '[C]Esta es una [G]prueba de [Am]acordes',
        'Do - Sol - La menor',
        'Sin audios por ahora',
        'prueba, test, api'
    ]);
    
    if ($resultado) {
        $id = $pdo->lastInsertId();
        echo "<p style='color: green;'>✓ Inserción exitosa. ID: $id</p>";
        
        // Recuperar el registro insertado
        $stmt = $pdo->prepare('SELECT * FROM tbl_canciones WHERE id = ?');
        $stmt->execute([$id]);
        $cancion = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo "<h3>Registro insertado:</h3>";
        echo "<pre>" . print_r($cancion, true) . "</pre>";
        
        // Eliminar el registro de prueba
        $stmt = $pdo->prepare('DELETE FROM tbl_canciones WHERE id = ?');
        $stmt->execute([$id]);
        echo "<p style='color: blue;'>ℹ Registro de prueba eliminado</p>";
        
    } else {
        echo "<p style='color: red;'>✗ Error en la inserción</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Error: " . $e->getMessage() . "</p>";
}

// 3. Verificar endpoints
echo "<h2>3. Verificando endpoints...</h2>";
$endpoints = [
    'index.php' => 'GET - Listar canciones',
    'create.php' => 'POST - Crear canción',
    'update.php' => 'PUT - Actualizar canción',
    'delete.php' => 'DELETE - Eliminar canción',
    'updates.php' => 'GET - Obtener actualizaciones'
];

foreach ($endpoints as $file => $desc) {
    if (file_exists(__DIR__ . '/' . $file)) {
        echo "<p style='color: green;'>✓ $file - $desc</p>";
    } else {
        echo "<p style='color: red;'>✗ $file - $desc (FALTA)</p>";
    }
}

// 4. Información del servidor
echo "<h2>4. Información del servidor:</h2>";
echo "<p><strong>PHP Version:</strong> " . PHP_VERSION . "</p>";
echo "<p><strong>Server:</strong> " . $_SERVER['SERVER_SOFTWARE'] . "</p>";
echo "<p><strong>Document Root:</strong> " . $_SERVER['DOCUMENT_ROOT'] . "</p>";
echo "<p><strong>Current Directory:</strong> " . __DIR__ . "</p>";

// 5. Test de JSON
echo "<h2>5. Test de procesamiento JSON:</h2>";
$test_json = '{"titulo":"Test","letra":"Letra de prueba","acordes":"[C]Test"}';
$parsed = json_decode($test_json, true);
if (json_last_error() === JSON_ERROR_NONE) {
    echo "<p style='color: green;'>✓ JSON parsing funciona correctamente</p>";
    echo "<pre>" . print_r($parsed, true) . "</pre>";
} else {
    echo "<p style='color: red;'>✗ Error en JSON: " . json_last_error_msg() . "</p>";
}

echo "<h2>6. Configuración recomendada:</h2>";
echo "<p>1. Actualiza las credenciales en <code>db.php</code></p>";
echo "<p>2. Asegúrate de que la base de datos existe</p>";
echo "<p>3. Verifica que todos los endpoints estén presentes</p>";
echo "<p>4. Configura CORS si es necesario</p>";
?>