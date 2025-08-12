// src/core/ChordTools.js
// Transposición y notación ES/EN para acordes dentro de [corchetes]

const EN_NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const EN_FLATS = ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'];

const ES_NOTES = ['Do','Do#','Re','Re#','Mi','Fa','Fa#','Sol','Sol#','La','La#','Si'];
const ES_FLATS = ['Do','Reb','Re','Mib','Mi','Fa','Solb','Sol','Lab','La','Sib','Si'];

function normalize(note) {
  // Mayúsculas y #/b compactos
  return note.replace(/([a-z]+)/i, (m)=>m[0].toUpperCase()+m.slice(1)).replace('♯','#').replace('♭','b');
}

function tokenizeChord(ch) {
  // Raíz + resto (m, maj7, sus4, etc.)
  const m = ch.match(/^([A-G][b#]?)(.*)$/i);
  if (!m) return null;
  return { root: normalize(m[1]), qual: m[2] || '' };
}

function noteIndexEN(root) {
  const i = EN_NOTES.indexOf(root);
  if (i >= 0) return i;
  const j = EN_FLATS.indexOf(root);
  return j >= 0 ? j : -1;
}

function transposeRootEN(root, steps) {
  const i = noteIndexEN(root);
  if (i < 0) return root;
  const idx = (i + (steps%12) + 12) % 12;
  // Mantén sostenidos si la original llevaba #, bemoles si llevaba b
  if (/#/.test(root)) return EN_NOTES[idx];
  if (/b/.test(root)) return EN_FLATS[idx];
  return EN_NOTES[idx];
}

function toES(root) {
  const i = noteIndexEN(root);
  if (i < 0) return root;
  // si raíz con b, usa ES_FLATS
  if (/b/.test(root)) return ES_FLATS[i];
  return ES_NOTES[i];
}

function toENfromES(root) {
  // convierte ES a EN (Do->C, Reb->Db, etc.)
  const idxES = ES_NOTES.indexOf(root);
  const idxESf = ES_FLATS.indexOf(root);
  const i = idxES >= 0 ? idxES : idxESf;
  if (i < 0) return root;
  if (/(b)/i.test(root)) return EN_FLATS[i];
  return EN_NOTES[i];
}

export function transposeText(text, steps) {
  return text.replace(/\[([^\]]+)\]/g, (full, inside) => {
    const t = tokenizeChord(inside.trim());
    if (!t) return full;
    const tr = transposeRootEN(t.root, steps);
    return `[${tr}${t.qual}]`;
  });
}

export function convertNotation(text, target='EN') {
  if (target === 'EN') {
    // ES -> EN si hace falta
    return text.replace(/\[([^\]]+)\]/g, (full, inside) => {
      // detectar raíces ES: Do, Re, Mi, Fa, Sol, La, Si (+ #/b)
      const m = inside.trim().match(/^((Do|Re|Mi|Fa|Sol|La|Si)(#|b)?)(.*)$/i);
      if (!m) return full;
      const rootES = m[1].replace(/^[a-z]/, c=>c.toUpperCase());
      const rest = m[4] || '';
      const rootEN = toENfromES(rootES);
      return `[${rootEN}${rest}]`;
    });
  } else {
    // EN -> ES
    return text.replace(/\[([^\]]+)\]/g, (full, inside) => {
      const t = tokenizeChord(inside.trim());
      if (!t) return full;
      const rootES = toES(t.root);
      return `[${rootES}${t.qual}]`;
    });
  }
}
