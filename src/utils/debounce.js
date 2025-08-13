// ============================================
// Archivo: /src/utils/debounce.js
// ============================================
export function createDebounced(fn, delay = 250) {
  let t = null;
  return (...args) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}
