// Función que recibe un texto con acordes marcados entre corchetes (por ejemplo: [C], [G#m7])
// y devuelve una versión HTML con los acordes sobre las letras de la canción, estilo karaoke o cancionero
export function procesarCancion(text) {
  // Validación inicial: si no hay texto o no es una cadena, se devuelve un mensaje indicando que no hay acordes
  if (!text || typeof text !== 'string') {
    return '<div class="sin-acordes">No hay acordes disponibles</div>';
  }

  // ✅ IMPORTANTE: Separamos el texto en líneas, manteniendo los saltos de línea originales como elementos del array.
  // Esto es crucial para respetar la estructura del texto al reconstruirlo luego
  let lines = text.split(/(\r\n|\r|\n)/);

  // Procesamos línea por línea
  let lineasProcesadas = lines.map((line, index) => {
    // 🔁 Caso 1: Si la línea está vacía pero el elemento anterior era un salto de línea, insertamos un <br> explícito
    if (line.trim() === "" && 
        (lines[index - 1] === "\r\n" || lines[index - 1] === "\n" || lines[index - 1] === "\r")) {
      return "<br>";
    }

    // 🔁 Caso 2: Si la línea es solo un salto de línea, lo ignoramos (ya fue procesado o será tratado en el punto anterior)
    if (line === "\r\n" || line === "\n" || line === "\r") {
      return "";
    }

    // 🎯 Buscamos acordes en la línea. Los acordes están en el formato [A], [G#m], [Fmaj7], etc.
    // Usamos expresiones regulares y `matchAll` para obtener todos los acordes con su índice.
    let coincidencias = [...line.matchAll(/\[([A-G][#b]?(m|7|m7|maj7|maj|dim|aug|sus|add)?)\]/g)];

    // Inicializamos dos cadenas: una para mostrar los acordes sobre las letras, otra para el texto con letras sin acordes
    let lineaAcordes = "";
    let lineaLyrics = line;
    let indiceActual = 0;

    // 🔁 Recorremos cada coincidencia (cada acorde encontrado)
    coincidencias.forEach((match) => {
      // Calculamos cuántos espacios hay entre el último acorde procesado y el actual
      let espacioHastaAcorde = match.index - indiceActual;
      if (espacioHastaAcorde <= 0) {
        espacioHastaAcorde = 0;
      }

      // Longitud del acorde sin corchetes, para ajustar el índice actual
      let ajuste = match[1].length;

      // Insertamos el acorde en la posición correspondiente, con espacios delante para alinear
      lineaAcordes += " ".repeat(espacioHastaAcorde) + 
                      `<span class="acorde">${match[1]}</span>`;

      // Actualizamos el índice para saber desde dónde calcular el próximo espacio
      indiceActual = match.index + match[0].length + ajuste;

      // ✅ CORRECCIÓN IMPORTANTE:
      // En la línea de letras, reemplazamos el acorde (por ejemplo [G]) por espacios, para que se mantenga la alineación visual,
      // sin eliminar letras ni interferir con el HTML ya presente.
      lineaLyrics = lineaLyrics.replace(match[0], "".repeat(match[0].length));
    });

    // Por cada línea original, devolvemos dos bloques HTML: uno para acordes y otro para letras.
    return `<div class="linea-acordes">${lineaAcordes}</div><div class="linea-lyrics">${lineaLyrics}</div>`;
  });

  // Finalmente, unimos todas las líneas procesadas en un solo string HTML
  return lineasProcesadas.join("");
}