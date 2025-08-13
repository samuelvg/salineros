# 🎵 Los Salineros – WebApp

Aplicación web progresiva (PWA) diseñada para **Los Salineros**, un grupo de música popular canaria de Carrizal.  
Permite consultar letras, acordes, melodías y audios de forma rápida desde cualquier dispositivo, incluso sin conexión.

---

## ✨ Características principales

- **Catálogo interactivo de canciones**  
  Consulta letras, acordes, melodías y audios con interfaz limpia y responsive.

- **Modo administrador**  
  Funciones de edición y gestión accesibles solo para miembros autorizados.

- **Funciona sin conexión (PWA)**  
  Instalación en dispositivos móviles y escritorio, con caché inteligente para recursos y datos.

- **Sincronización offline-first**  
  Cambios realizados sin conexión se guardan en cola y se envían automáticamente al recuperar internet.

- **Calendario de eventos**  
  Integración con calendario ICS para mostrar actuaciones y ensayos.

- **Diseño responsive**  
  Adaptado a móviles, tablets y escritorio, con rejilla optimizada para diferentes resoluciones.

---

## 🛠️ Tecnologías utilizadas

- **Frontend**  
  - HTML5 + CSS3 (responsive y accesible)  
  - JavaScript ES Modules  
  - [Dexie.js](https://dexie.org/) para almacenamiento local (IndexedDB)  
  - [FullCalendar](https://fullcalendar.io/) para gestión de eventos

- **Backend**  
  - PHP con PDO y prepared statements  
  - CORS seguro y validación de origen  
  - Configuración centralizada con `.env`

- **PWA**  
  - Service Worker con precaching y runtime caching  
  - Manifest para instalación en dispositivos  
  - Estrategia *offline-first*  

---

## 🚀 Instalación y ejecución local

1. Clonar el repositorio:
git clone https://github.com/tuusuario/los-salineros.git

Configurar entorno:
Copiar .env.example a .env y completar variables.
Configurar base de datos y credenciales.
   
📱 Uso en dispositivos móviles
Abrir la URL de la aplicación en el navegador del dispositivo.
Usar la opción "Añadir a la pantalla de inicio".
Acceder como si fuera una app nativa, incluso sin conexión.

🔒 Seguridad
Acceso administrativo protegido mediante sesión y clave API.
Filtrado de HTML permitido para prevenir inyecciones.
Control de CORS restringido a dominios autorizados.

📅 Licencia
Este proyecto es de uso interno para Los Salineros.
Para más información sobre su uso o adaptación, contactar con el equipo desarrollador.

Desarrollado con cariño para mantener viva la música canaria. 🎶
