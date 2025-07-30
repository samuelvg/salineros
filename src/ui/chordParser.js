// Procesar la letra de la canción para separar acordes y letra
  export function procesarCancion(text) {
    // Usamos una expresión regular para dividir el texto manteniendo las líneas vacías en caso de doble salto
    let lines = text.split(/(\r\n|\r|\n)/);

    // Procesar cada línea por separado
    let lineasProcesadas = lines.map((line, index) => {
      // Si la línea está vacía, mantenemos el espacio en blanco para preservar la estructura de las estrofas
      if (
        line.trim() === "" &&
        (lines[index - 1] === "\r\n" ||
          lines[index - 1] === "\n" ||
          lines[index - 1] === "\r")
      ) {
        return "<br>"; // Añadimos un <br> adicional para representar el espacio en blanco
      }

      // Evitar procesar saltos de línea capturados
      if (line === "\r\n" || line === "\n" || line === "\r") {
        return ""; // Evitamos agregar un <br> adicional en saltos simples
      }

      // Buscar acordes en la línea
      let coincidencias = [...line.matchAll(/\[([A-G][#b]?(m|7|m7)?)\]/g)];
      let lineaAcordes = ""; // Línea que contendrá los acordes
      let lineaLyrics = line; // Línea que contendrá la letra sin los acordes
      let indiceActual = 0;

      coincidencias.forEach((match) => {
        let espacioHastaAcorde = match.index - indiceActual; // Espacios necesarios hasta el acorde actual
        if (espacioHastaAcorde <= 0) {
          espacioHastaAcorde = 0;
        }

        let ajuste = match[1].length;
        

        // Añadir los espacios antes del acorde
        lineaAcordes +=
          " ".repeat(espacioHastaAcorde) +
          `<span class="acorde">${match[1]}</span>`;
        // Actualizamos el índice actual considerando la longitud del acorde y los corchetes originales
        indiceActual = match.index + match[0].length + ajuste;

        // Reemplazamos el acorde en la letra con espacios correspondientes
        lineaLyrics = lineaLyrics.replace(match[0], "".repeat(match[0].length));
      });

      // Devolver la línea procesada con los acordes y la letra
      return `<div class="linea-acordes">${lineaAcordes}</div><div class="linea-lyrics">${lineaLyrics}</div>`;
    });

    // Unir las líneas procesadas sin agregar saltos adicionales, solo respetando los <br> añadidos
    return lineasProcesadas.join("");
  }