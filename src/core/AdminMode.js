// src/core/AdminMode.js
// Modo admin (UI). La seguridad real la aplica el backend con X-API-KEY.

export const AdminMode = (() => {
  const KEY = 'afsalineros_admin_enabled';
  const KEY_API = 'afsalineros_api_key';

  let enabled = false;

  try { enabled = sessionStorage.getItem(KEY) === '1'; } catch {}

  function isEnabled() { return enabled; }

  function setEnabled(v) {
    enabled = !!v;
    try {
      if (enabled) {
        sessionStorage.setItem(KEY, '1');
        document.documentElement.classList.add('admin-on');
      } else {
        sessionStorage.removeItem(KEY);
        sessionStorage.removeItem(KEY_API);
        document.documentElement.classList.remove('admin-on');
      }
    } catch {}
  }

  function setApiKey(apiKey) {
    try {
      if (apiKey && apiKey.trim() !== '') {
        sessionStorage.setItem(KEY_API, apiKey.trim());
      } else {
        sessionStorage.removeItem(KEY_API);
      }
    } catch {}
  }

  function getApiKey() {
    try { return sessionStorage.getItem(KEY_API) || null; } catch { return null; }
  }

  // Mantener clase si ya estaba activo
  if (enabled) document.documentElement.classList.add('admin-on');

  return { isEnabled, setEnabled, setApiKey, getApiKey };
})();
