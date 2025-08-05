<?php
// ============================================
// Archivo: /intranet3/api/songs/db.php
// ============================================

// Configuración de la base de datos
$host = '51.38.225.194';
$dbname = 'bdsalinera';
$username = 'samuelvg';
$password = 'ilea2003pp';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ]);
} catch (PDOException $e) {
    error_log("Error de conexión a BD: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos']);
    exit;
}

// Crear tabla si no existe
$createTable = "
CREATE TABLE IF NOT EXISTS tbl_canciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    letra TEXT,
    acordes TEXT,
    melodia TEXT,
    audios TEXT,
    etiquetas VARCHAR(500),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_updated_at (updated_at),
    INDEX idx_titulo (titulo),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";

try {
    $pdo->exec($createTable);
} catch (PDOException $e) {
    // Tabla ya existe o error en creación - log pero continuar
    error_log("Advertencia al crear tabla: " . $e->getMessage());
}
?>