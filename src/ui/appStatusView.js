// ============================================
// Archivo: /src/ui/appStatusView.js
// ============================================

export const AppStatusView = {
  init() {
    // Crear barra de estado
    this.container = document.getElementById('status-bar') || document.createElement('div');
    this.container.id = 'status-bar';
    if (!document.getElementById('status-bar')) {
    document.body.insertBefore(this.container, document.getElementById('app'));
    }
    this.container.innerHTML = `
      <span id="online-status" class="status-pill">Offline</span>
      <span id="sync-status"></span>
      <span id="last-sync"></span>
    `;
    // Escuchar cambios online/offline
    window.addEventListener('online',  () => this.updateOnlineStatus(true));
    window.addEventListener('offline', () => this.updateOnlineStatus(false));
    // Escuchar eventos de sincronización
    window.addEventListener('sync:start', () => this.showSyncSpinner());
    window.addEventListener('sync:end',   e => {
      this.hideSyncSpinner();
      this.updateLastSync(e.detail);
      this.showToast('Sincronización completada');
    });
    // Estado inicial
    this.updateOnlineStatus(navigator.onLine);
  },

  updateOnlineStatus(isOnline) {
    const pill = document.getElementById('online-status');
    pill.textContent = isOnline ? 'Online' : 'Offline';
    pill.classList.toggle('status-online', isOnline);
    pill.classList.toggle('status-offline', !isOnline);
  },

  showSyncSpinner() {
    const sync = document.getElementById('sync-status');
    sync.innerHTML = '<span class="spinner"></span> Sincronizando...';
  },

  hideSyncSpinner() {
    document.getElementById('sync-status').textContent = '';
  },

  updateLastSync(date) {
    const last = document.getElementById('last-sync');
    const d = date instanceof Date ? date : new Date(date);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth()+1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    last.textContent = `Última sync: ${dd}/${mm}/${yyyy} ${hh}:${min}`;
  },

  showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('visible'), 100);
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => document.body.removeChild(toast), 500);
    }, duration);
  }
};
