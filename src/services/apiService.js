// ============================================
// Archivo: /src/services/apiService.js
// Servicio de acceso a la API de canciones
// - Detecta automáticamente la baseUrl (/intranetX/api/songs)
// - Inyecta X-API-KEY desde sessionStorage (modo admin UI)
// - Manejo de timeouts y errores consistente
// ============================================

export class APIService {
  static _memCache = new Map();
  static _cacheGet(key){ const it=this._memCache.get(key); if(!it) return null; if(Date.now()>it.expires){this._memCache.delete(key); return null;} return it.data; }
  static _cacheSet(key,data,ttl=300000){ this._memCache.set(key,{data,expires:Date.now()+ttl}); }
  static _cacheInvalidate(pattern=''){ if(!pattern){this._memCache.clear(); return;} for(const k of Array.from(this._memCache.keys())) if(k.includes(pattern)) this._memCache.delete(k); }

  // ---- Config/helpers internos --------------------------------------------

  // Detección robusta de baseUrl:
  // 1) Si existe window.__APP_CONFIG__ o window.appConfig con api.baseUrl, lo usamos
  // 2) Si no, deducimos /intranetX/ del pathname actual y construimos /intranetX/api/songs
  // 3) Fallback: /api/songs
  static baseUrl() {
    try {
      const cfg = (typeof window !== 'undefined') && (window.__APP_CONFIG__ || window.appConfig);
      if (cfg?.api?.baseUrl) {
        return cfg.api.baseUrl.replace(/\/+$/, '');
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

  // Timeout por defecto (puedes sobreescribirlo vía window.__APP_CONFIG__.api.timeout)
  static timeoutMs() {
    try {
      const cfg = (typeof window !== 'undefined') && (window.__APP_CONFIG__ || window.appConfig);
      if (cfg?.api?.timeout) return cfg.api.timeout;
    } catch {}
    return 10000; // 10s
  }

  // API Key guardada en sesión (se establece desde AdminMode)
  static getApiKey() {
    try { return sessionStorage.getItem('afsalineros_api_key'); } catch { return null; }
  }

  // Construye cabeceras estándar + X-API-KEY si procede
  static buildHeaders(extra = {}) {
    const base = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
    const k = APIService.getApiKey();
    if (k) base['X-API-KEY'] = k;
    return { ...base, ...extra };
  }

  // Fetch con timeout (AbortController)
  static async _fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), APIService.timeoutMs());
    try {
      const resp = await fetch(url, { credentials:'include', ...options, signal: controller.signal });
      return resp;
    } finally {
      clearTimeout(id);
    }
  }

  // Manejo uniforme de respuesta
  static async handleResponse(response) {
    let data = null;
    const contentType = response.headers.get('Content-Type') || '';
    if (response.status !== 204) {
      if (contentType.includes('application/json')) {
        try { data = await response.json(); } catch { data = null; }
      } else {
        try { data = await response.text(); } catch { data = null; }
      }
    }
    if (!response.ok) {
      // Intenta construir un mensaje útil
      let msg = 'Error de servidor';
      if (data && typeof data === 'object' && (data.error || data.details)) {
        msg = data.error + (data.details ? `: ${data.details}` : '');
      } else if (typeof data === 'string' && data.trim()) {
        msg = data;
      } else {
        msg = `HTTP ${response.status}`;
      }
      throw new Error(msg);
    }
    return data;
  }

  // ---- Endpoints -----------------------------------------------------------

  // Lista todas las canciones
  static async getAll() {
    const cacheKey = `${APIService.baseUrl()}/index.php`; const c=this._cacheGet(cacheKey); if(c) return c;
    const url = `${APIService.baseUrl()}/index.php`;
    console.log('Obteniendo todas las canciones...', url);
    const resp = await APIService._fetchWithTimeout(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    const data = await APIService.handleResponse(resp);
    this._cacheSet(cacheKey, data, 300000);
    return data;
  }

  // Obtiene actualizaciones desde una fecha ISO (YYYY-MM-DDTHH:mm:ssZ)
  static async getUpdates(sinceISO) {
    const cacheKey = `${APIService.baseUrl()}/updates.php?since=${sinceISO}`; const c=this._cacheGet(cacheKey); if(c) return c;
    const url = `${APIService.baseUrl()}/updates.php?since=${encodeURIComponent(sinceISO)}`;
    const resp = await APIService._fetchWithTimeout(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    const data = await APIService.handleResponse(resp);
    this._cacheSet(cacheKey, data, 30000);
    return data;
  }

  // Crea una canción
  // song = { titulo, letra?, acordes?, melodia?, audios?, etiquetas? | tags? }
  static async create(song) {
    try {
      const url = `${APIService.baseUrl()}/create.php`;
      const resp = await APIService._fetchWithTimeout(url, {
        method: 'POST',
        headers: APIService.buildHeaders(),
        body: JSON.stringify(song || {})
      });
      const data = await APIService.handleResponse(resp);
      APIService._cacheInvalidate('/index.php');
      console.log('Canción creada:', data?.id ?? '(sin id)');
      return data;
    } catch (error) {
      console.error('Error en create:', error);
      throw new Error(`Error al crear canción: ${error.message}`);
    }
  }

  // Actualiza una canción
  // song = { id, titulo?, letra?, acordes?, melodia?, audios?, etiquetas? | tags? }
  static async update(song) {
    if (!song || !song.id) throw new Error('Falta id para actualizar');
    try {
      const url = `${APIService.baseUrl()}/update.php`;
      const resp = await APIService._fetchWithTimeout(url, {
        method: 'POST', // PHP acepta JSON por POST; más fiable que PUT en muchos hostings
        headers: APIService.buildHeaders(),
        body: JSON.stringify(song)
      });
      const data = await APIService.handleResponse(resp);
      APIService._cacheInvalidate('/index.php');
      console.log('Canción actualizada:', song.id);
      return data;
    } catch (error) {
      console.error('Error en update:', error);
      throw new Error(`Error al actualizar canción ${song.id}: ${error.message}`);
    }
  }

  // Elimina una canción por id
  static async remove(id) {
    if (!id) throw new Error('Falta id para eliminar');
    try {
      const url = `${APIService.baseUrl()}/delete.php`;
      // Usamos DELETE con body JSON (nuestro PHP lo soporta leyendo php://input)
      const resp = await APIService._fetchWithTimeout(url, {
        method: 'DELETE',
        headers: APIService.buildHeaders(),
        body: JSON.stringify({ id })
      });
      await APIService.handleResponse(resp);
      APIService._cacheInvalidate('/index.php');
      console.log('Canción eliminada exitosamente:', id);
      return true;
    } catch (error) {
      console.error('Error en remove:', error);
      throw new Error(`Error al eliminar canción ${id}: ${error.message}`);
    }
  }

  // Devuelve cambios desde una fecha ISO (ver /api/songs/updates.php)
static async fetchUpdates(sinceIso = '') {
  const url = `${APIService.baseUrl()}/updates.php?since=${encodeURIComponent(sinceIso || '')}`;
  const resp = await APIService._fetchWithTimeout(url, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });
  const data = await APIService.handleResponse(resp);
    // El endpoint devuelve un array de canciones modificadas desde "since".
  // Para no romper SyncManager (que espera {creadas, modificadas, eliminadas}),
  // encajamos todo en "modificadas".
  if (Array.isArray(data)) {
    return { creadas: [], modificadas: data, eliminadas: [] };
  }
  // Si en el futuro devolvemos el objeto ya tipado, lo respetamos:
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
