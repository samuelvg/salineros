// ============================================
// Archivo: /src/services/apiService.js
// Servicio de acceso a la API (canciones)
// Versión: v2 (refactor seguro, retrocompatible)
// - BaseUrl autodetectable o por config
// - Cache en memoria con TTL + invalidación por patrón
// - Coalescing de peticiones concurrentes al mismo recurso
// - Timeouts con AbortController y manejo de errores uniforme
// - Normalización de respuestas (create/update)
// - Opción para NO enviar X-API-KEY desde navegador por seguridad
// ============================================

/* eslint-disable no-console */

export class APIService {
  // ---- Estado interno -------------------------------------------------------
  static _memCache = new Map();        // key -> { data, expires }
  static _inflight = new Map();        // key -> Promise<Response>

  // ---- Cache helpers --------------------------------------------------------
  /** @param {string} key */
  static _cacheGet(key) {
    const it = this._memCache.get(key);
    if (!it) return null;
    if (it.expires && it.expires < Date.now()) {
      this._memCache.delete(key);
      return null;
    }
    return it.data;
  }
  /** @param {string} key @param {any} data @param {number} ttlMs */
  static _cacheSet(key, data, ttlMs = 5 * 60 * 1000) {
    this._memCache.set(key, { data, expires: Date.now() + ttlMs });
  }
  /** Invalida claves que incluyan el patrón (substring) */
  static _cacheInvalidate(pattern = '') {
    if (!pattern) {
      this._memCache.clear();
      return;
    }
    for (const k of Array.from(this._memCache.keys())) {
      if (k.includes(pattern)) this._memCache.delete(k);
    }
  }

  // ---- Config/helpers internos --------------------------------------------

  // Detección robusta de baseUrl:
  // 1) window.__APP_CONFIG__.api.baseUrl (o window.appConfig)
  // 2) Deducción por /intranetX/ del pathname actual -> /intranetX/api/songs
  // 3) Fallback: /api/songs
  static baseUrl() {
    try {
      const cfg = (typeof window !== 'undefined') && (window.__APP_CONFIG__ || window.appConfig);
      if (cfg?.api?.baseUrl) {
        return String(cfg.api.baseUrl).replace(/\/+$/, '');
      }
    } catch {}
    try {
      const m = (typeof location !== 'undefined') ? location.pathname.match(/\/intranet\d+\//) : null;
      const prefix = m ? m[0] : '/';
      const norm = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
      return `${norm}/api/songs`;
    } catch {
      return '/api/songs';
    }
  }

  // Timeout por defecto (ms). Configurable con window.__APP_CONFIG__.api.timeout
  static timeoutMs() {
    try {
      const cfg = (typeof window !== 'undefined') && (window.__APP_CONFIG__ || window.appConfig);
      if (cfg?.api?.timeout) return Number(cfg.api.timeout);
    } catch {}
    return 10000;
  }

  // ¿Enviar X-API-KEY desde el navegador?
  // Por seguridad, lo DESACTIVAMOS por defecto. Si necesitas activarlo temporalmente:
  // window.__APP_CONFIG__ = { api: { sendApiKeyFromBrowser: true } }
  static _shouldSendApiKeyFromBrowser() {
    try {
      const cfg = (typeof window !== 'undefined') && (window.__APP_CONFIG__ || window.appConfig);
      return !!cfg?.api?.sendApiKeyFromBrowser;
    } catch { return false; }
  }

  // API Key guardada en sesión (establecida desde AdminMode)
  static getApiKey() {
    try { return sessionStorage.getItem('afsalineros_api_key'); } catch { return null; }
  }

  // Construye cabeceras estándar (con X-API-KEY sólo si está permitido)
  static buildHeaders(extra = {}) {
    const base = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
    // Adjuntar API key sólo si el proyecto lo permite explícitamente
    if (this._shouldSendApiKeyFromBrowser()) {
      const k = APIService.getApiKey();
      if (k) base['X-API-KEY'] = k;
    }
    return { ...base, ...extra };
  }

  // Fetch con timeout y coalescing opcional
  static async _fetchWithTimeout(url, options = {}) {
    const cacheKey = `REQ:${options.method || 'GET'}:${url}`;
    // Coalesce únicamente para GET (idempotente)
    const canCoalesce = (options.method || 'GET').toUpperCase() === 'GET';
    if (canCoalesce && this._inflight.has(cacheKey)) {
      return this._inflight.get(cacheKey);
    }

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), APIService.timeoutMs());
    const exec = fetch(url, {
      credentials: 'include', // cookies de sesión admin si aplica
      ...options,
      signal: controller.signal
    }).finally(() => {
      clearTimeout(id);
      if (canCoalesce) this._inflight.delete(cacheKey);
    });

    if (canCoalesce) this._inflight.set(cacheKey, exec);
    try {
      return await exec;
    } catch (e) {
      if (e && e.name === 'AbortError') {
        const err = new Error('Request timeout');
        err.code = 'ETIMEDOUT';
        throw err;
      }
      throw e;
    }
  }

  // Manejo uniforme de respuesta (devuelve JSON si hay, si no texto; lanza en !ok)
  static async handleResponse(response) {
    let raw = null;
    try { raw = await response.text(); } catch { raw = null; }

    if (!response.ok) {
      const err = new Error(`${response.status} ${response.statusText}`);
      err.status = response.status;
      err.body = raw;
      // Señalizar auth para capas superiores si procede
      if (response.status === 401 || response.status === 403) err.code = 'AUTH';
      throw err;
    }

    if (response.status === 204 || raw == null || raw === '') return null;

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try { return JSON.parse(raw); } catch { return null; }
    }
    return raw; // texto u otro tipo
  }

  // ---- Endpoints -----------------------------------------------------------

  /** Lista todas las canciones */
  static async getAll() {
    const url = `${APIService.baseUrl()}/index.php`;
    const c = this._cacheGet(url); if (c) return c;

    const resp = await APIService._fetchWithTimeout(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    const data = await APIService.handleResponse(resp);
    this._cacheSet(url, data, 5 * 60 * 1000);
    return data;
  }

  /** Obtiene actualizaciones desde una fecha ISO. (No envía ?since= si va vacía) */
  static async getUpdates(sinceISO) {
    let url = `${APIService.baseUrl()}/updates.php`;
    if (sinceISO != null && sinceISO !== '') {
      url += `?since=${encodeURIComponent(String(sinceISO))}`;
    }
    const cacheKey = url;
    const c = this._cacheGet(cacheKey); if (c) return c;

    const resp = await APIService._fetchWithTimeout(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    const data = await APIService.handleResponse(resp);
    this._cacheSet(cacheKey, data, 30 * 1000); // cache corto
    return data;
  }

  /** Alias retrocompatible */
  static async fetchUpdates(sinceIso = '') {
    return this.getUpdates(sinceIso);
  }

  /** Crea una canción. Devuelve SIEMPRE la canción plana */
  static async create(song) {
    if (!song || typeof song !== 'object') throw new Error('Falta song para crear');
    try {
      const url = `${APIService.baseUrl()}/create.php`;
      const resp = await APIService._fetchWithTimeout(url, {
        method: 'POST',
        headers: APIService.buildHeaders(),
        body: JSON.stringify(song)
      });
      const data = await APIService.handleResponse(resp);

      // create.php devuelve la canción plana (según backend actual)
      const normalized = data && data.song ? data.song : data;

      // invalidar listados
      APIService._cacheInvalidate('/index.php');
      return normalized;
    } catch (error) {
      console.error('Error en create:', error);
      throw new Error(`Error al crear canción: ${error.message}`);
    }
  }

  /**
   * Actualiza una canción
   * Permite 2 firmas:
   *   - update(songConId)
   *   - update(id, songParcial)
   * Devuelve SIEMPRE la canción plana (no el wrapper { ok, song })
   */
  static async update(idOrSong, maybeSong = null) {
    const song =
      (idOrSong && typeof idOrSong === 'object')
        ? idOrSong
        : { ...(maybeSong || {}), id: idOrSong };

    if (!song || !song.id) throw new Error('Falta id para actualizar');

    try {
      const url = `${APIService.baseUrl()}/update.php`;
      const resp = await APIService._fetchWithTimeout(url, {
        method: 'POST', // PHP acepta JSON por POST
        headers: APIService.buildHeaders(),
        body: JSON.stringify(song)
      });

      const data = await APIService.handleResponse(resp);

      // update.php suele devolver { ok, song }
      const normalized = (data && typeof data === 'object' && 'song' in data) ? data.song : data;

      APIService._cacheInvalidate('/index.php');
      return normalized;
    } catch (error) {
      console.error('Error en update:', error);
      throw new Error(`Error al actualizar canción ${song.id}: ${error.message}`);
    }
  }

  /** Elimina una canción por id */
  static async remove(id) {
    if (!id) throw new Error('Falta id para eliminar');
    try {
      const url = `${APIService.baseUrl()}/delete.php`;
      // DELETE con body JSON (nuestro PHP lo soporta leyendo php://input)
      const resp = await APIService._fetchWithTimeout(url, {
        method: 'DELETE',
        headers: APIService.buildHeaders(),
        body: JSON.stringify({ id })
      });
      await APIService.handleResponse(resp);
      APIService._cacheInvalidate('/index.php');
      return true;
    } catch (error) {
      console.error('Error en remove:', error);
      throw new Error(`Error al eliminar canción ${id}: ${error.message}`);
    }
  }

  /**
   * Normaliza la estructura { creadas, modificadas, eliminadas } de updates
   * Acepta también un array simple (lo mapea a 'modificadas')
   */
  static normalizeUpdatesPayload(data) {
    if (Array.isArray(data)) {
      return { creadas: [], modificadas: data, eliminadas: [] };
    }
    if (data && (data.creadas || data.modificadas || data.eliminadas)) {
      return {
        creadas: data.creadas || [],
        modificadas: data.modificadas || [],
        eliminadas: data.eliminadas || []
      };
    }
    return { creadas: [], modificadas: [], eliminadas: [] };
  }
}
