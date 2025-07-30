# Intranet Folklórica

Este proyecto es la aplicación web encargada de gestionar el repertorio y las pistas de audio de un grupo folklórico. Arrancó como una intranet básica (versión original) y ha sido refactorizada completamente en la versión actual, mejorando la arquitectura y añadiendo nuevas funcionalidades.

---

## ⚙️ Características principales

1. **Gestión de canciones**: crea, edita y elimina canciones con título, letra y acordes.
2. **Renderizado de acordes**: visualiza diagramas de acordes en formato gráfico usando Raphael y VexChords.
3. **Reproductor multipista**: carga y reproduce varias pistas de audio simultáneamente con controles de play/pausa.
4. **Interfaz modular y moderna**: basada en ES Modules, con separación clara entre vistas, servicios y componentes UI.
5. **Fácil de extender**: clase `MultiTrackPlayer` y función `renderChords` desacopladas para reutilizar en otras vistas.

---

## 📥 Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/tu-usuario/intranet-folklorica.git
   cd intranet-folklorica

2. Instala dependencias (opcionalmente usa npm o yarn):

   ```bash
   npm install

3. Ejecuta el servidor local (o simplemente abre `index.html` si es un proyecto sin build):

   ```bash
   npm start       # si está configurado con un bundler

4. Abre en tu navegador:
