// ============================================
// Archivo: /src/ui/chordParser.js
// Parser de acordes -> HTML con 2 líneas (acordes + letra)
// - Soporta notación EN (C, D, Em, F#...) y ES (Do, Re, Mim, Fa#...)
// - Alinea usando fuente monoespaciada en ambas líneas
// - Respeta saltos en blanco y comentarios (líneas que empiezan por "#")
// ============================================

export function procesarCancion(text, opts = {}) {
  const notation = (opts.notation === 'ES') ? 'ES' : 'EN';
  const lines = (text || '').split(/\r?\n/);

  const htmlParts = [];
  for (const rawLine of lines) {
    if (rawLine.trim() === '') {
      htmlParts.push('<div class="linea vacia"><br/></div>');
      continue;
    }
    if (/^\s*#/.test(rawLine)) {
      htmlParts.push(`<div class="linea comentario"><div class="linea-lyrics monospace lyric-text">` + escapeHTML(rawLine) + `</div></div>`);
      continue;
    }

    const parsed = parseChordedLine(rawLine, notation);
    const chordRow = collapseToHTML(parsed.chordRow);
    const lyricRow = escapeHTML(parsed.lyricRow);

    htmlParts.push(
      `<div class="linea">` +
        `<div class="linea-acordes monospace chord-text"><code>${chordRow}</code></div>` +
        `<div class="linea-lyrics monospace lyric-text">${lyricRow}</div>` +
      `</div>`
    );
  }
  return `<div class="chord-lyrics-block">${htmlParts.join('')}</div>`;
}

function parseChordedLine(line, notation) {
  const chordBuf = [];
  const lyricOut = [];
  let col = 0;
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    if (ch === '[') {
      const close = line.indexOf(']', i + 1);
      if (close === -1) {
        lyricOut.push(ch);
        ensureLen(chordBuf, col);
        col++;
        i++;
        continue;
      }
      const rawChord = line.slice(i + 1, close).trim();
      const chord = normalizeChord(rawChord, notation);
      paintChord(chordBuf, col, chord);
      i = close + 1;
      continue;
    }
    lyricOut.push(ch);
    ensureLen(chordBuf, col);
    col++;
    i++;
  }
  ensureLen(chordBuf, col);
  return { chordRow: chordBuf, lyricRow: lyricOut.join('') };
}

function ensureLen(buf, len) { while (buf.length < len) buf.push(' '); }
function paintChord(buf, col, chord) { ensureLen(buf, col); for (let k=0;k<chord.length;k++) buf[col+k]=chord[k]; }
function collapseToHTML(buf) { const txt = buf.join('').replace(/ +$/, ''); return escapeHTML(txt).replace(/ /g, '&nbsp;'); }

function normalizeChord(raw, notation) {
  const chord = raw.replace(/\s+/g, '');
  if (notation === 'EN') return chord;
  return chord.replace(/([A-G])([#b]?)(.*)/, (_, root, acc, tail) => mapRootENtoES(root) + acc + mapMinorTail(tail));
}
function mapRootENtoES(r) {
  switch (r) { case 'A': return 'La'; case 'B': return 'Si'; case 'C': return 'Do'; case 'D': return 'Re'; case 'E': return 'Mi'; case 'F': return 'Fa'; case 'G': return 'Sol'; default: return r; }
}
function mapMinorTail(tail) { return tail; }
function escapeHTML(str) { return String(str).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
