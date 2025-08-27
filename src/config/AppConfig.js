// src/config/AppConfig.js - Versión corregida para afsalineros.es

export const AppConfig = {
  // API Configuration
  api: {
    // Resuelto dinámicamente en getEnvironmentConfig()
    baseUrl: '',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000
  },

  debug: false,

  // Google Calendar (opcional)
  googleCalendar: {
    apiKey: '',        // Si está vacío, no se activa el plugin
    calendarId: '',
    locale: 'es'
  },

  // Admin (solo UI; el backend usa API-KEY)
  admin: {
    // HASH SHA-256 de la contraseña (cámbiala).
    passwordHash: '5f57054d2809b8835981717c0cb02a8ff1bf09322eb8289225ab19900930aa95'
  },

  // Preferencias UI
  ui: {
    defaultFontSize: 16, // px para letras
    defaultNotation: 'EN' // 'EN' o 'ES'
  },

  // Cache Configuration
  cache: {
    name: 'CancionesDB',
    version: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
    cleanupInterval: 24 * 60 * 60 * 1000 // 24 horas
  },

  // Sync Configuration
  sync: {
    interval: 5 * 60 * 1000, // 5 minutos
    maxRetries: 3,
    backoffMultiplier: 2
  },

  // UI Configuration
  ui: {
    animations: {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      reduced: false // se detecta automáticamente
    },
    
    notifications: {
      duration: 4000,
      maxVisible: 5,
      position: 'bottom-center'
    },

    form: {
      autoSave: true,
      autoSaveInterval: 30000, // 30 segundos
      validateOnChange: true
    }
  },

  // Feature flags
  features: {
    offlineMode: true,
    audioPlayer: true,
    chordDiagrams: true,
    exportFeatures: true,
    advancedSearch: false // próximamente
  },

  // Validation rules
  validation: {
    titulo: { min: 2, max: 100, required: true },
    letra: { min: 10, max: 10000, required: true },
    acordes: { max: 5000, pattern: /\[[A-G][#b]?(maj7|dim|aug|m7|m|7)?\]/g },
    etiquetas: { maxCount: 10, maxLength: 20 }
  },

  // Información de la aplicación
  app: {
    name: 'Los Salineros',
    version: '1.0.0',
    author: 'Agrupación Folclórica Salineros'
  }
};

// Configuración específica por entorno
export const getEnvironmentConfig = () => {
  const hostname = location.hostname;
  
  // Detectar entorno de desarrollo
  const isDevelopment = 
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.startsWith('192.168.') || // Red local
    hostname.endsWith('.local') ||      // Desarrollo local
    location.port !== '';               // Puerto específico
  
  console.log('🌍 Entorno detectado:', isDevelopment ? 'desarrollo' : 'producción');
  console.log('🔗 Hostname:', hostname);

  return {
    ...AppConfig,
    
    // Configuración de API según entorno
    api: {
      ...AppConfig.api,
      debug: isDevelopment,
      baseUrl: isDevelopment 
        ? 'http://localhost/intranet2/api/songs'    // Desarrollo local
        : '/intranet2/api/songs',                   // Producción (afsalineros.es)
      
      // En desarrollo, más logging y timeouts más largos
      timeout: isDevelopment ? 15000 : AppConfig.api.timeout,
      retryDelay: isDevelopment ? 2000 : AppConfig.api.retryDelay
    },
    
    // Configuración de UI según entorno
    ui: {
      ...AppConfig.ui,
      animations: {
        ...AppConfig.ui.animations,
        // Detectar preferencia de animaciones reducidas
        reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        // En desarrollo, animaciones más rápidas para testing
        duration: isDevelopment ? 150 : AppConfig.ui.animations.duration
      },
      
      notifications: {
        ...AppConfig.ui.notifications,
        // En desarrollo, notificaciones más duraderas para debugging
        duration: isDevelopment ? 8000 : AppConfig.ui.notifications.duration
      }
    },
    
    // Sync más frecuente en desarrollo para testing
    sync: {
      ...AppConfig.sync,
      interval: isDevelopment 
        ? 2 * 60 * 1000   // 2 minutos en desarrollo
        : AppConfig.sync.interval
    },
    
    // Features adicionales en desarrollo
    features: {
      ...AppConfig.features,
      advancedSearch: isDevelopment, // Habilitar en desarrollo para testing
      debugMode: isDevelopment
    },
    
    // Información adicional
    environment: {
      isDevelopment,
      hostname,
      port: location.port || '80/443',
      protocol: location.protocol,
      buildTime: new Date().toISOString()
    }
  };
};

// Configuración específica para diferentes dominios (si necesitas más entornos)
export const getDomainSpecificConfig = () => {
  const hostname = location.hostname;
  
  switch (hostname) {
    case 'localhost':
    case '127.0.0.1':
      return {
        name: 'Desarrollo Local',
        api: {
    // Resuelto dinámicamente en getEnvironmentConfig()
    baseUrl: '',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000
  },
        features: { debugMode: true, advancedSearch: true }
      };
      
    case 'staging.afsalineros.es': // Si tienes un entorno de staging
      return {
        name: 'Staging',
        api: {
    // Resuelto dinámicamente en getEnvironmentConfig()
    baseUrl: '',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000
  },
        features: { debugMode: true }
      };
      
    case 'afsalineros.es':
    case 'www.afsalineros.es':
      return {
        name: 'Producción',
        api: {
    // Resuelto dinámicamente en getEnvironmentConfig()
    baseUrl: '',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000
  },
        features: { debugMode: false }
      };
      
    default:
      // Configuración por defecto para dominios no reconocidos
      console.warn('⚠️ Dominio no reconocido:', hostname, '-> uso configuración de PRODUCCIÓN por defecto');
return {
  ...AppConfig,
  api: { ...AppConfig.api, baseUrl: '/intranet2/api/songs' },
  environment: {
    isDevelopment: false,
    hostname,
    port: location.port || '',
    protocol: location.protocol,
    buildTime: new Date().toISOString()
  },
  features: { ...AppConfig.features, debugMode: false }
};
  }
};

// Helper para debug - solo disponible en desarrollo
export const debugConfig = () => {
  const config = getEnvironmentConfig();
  
  if (config.environment.isDevelopment) {
    console.group('🔧 Configuración de Los Salineros');
    console.log('Entorno:', config.environment.isDevelopment ? 'Desarrollo' : 'Producción');
    console.log('Hostname:', config.environment.hostname);
    console.log('API Base URL:', config.api.baseUrl);
    console.log('Debug activado:', config.api.debug);
    console.log('Features:', config.features);
    console.log('Configuración completa:', config);
    console.groupEnd();
  }
  
  return config;
};

// Validar configuración en tiempo de ejecución
export const validateConfig = (config) => {
  const errors = [];
  
  // Validar API
  if (!config.api.baseUrl) {
    errors.push('API baseUrl no configurada');
  }
  
  if (!config.api.timeout || config.api.timeout < 1000) {
    errors.push('API timeout debe ser al menos 1000ms');
  }
  
  // Validar cache
  if (!config.cache.name) {
    errors.push('Cache name no configurado');
  }
  
  // Validar sync
  if (!config.sync.interval || config.sync.interval < 30000) {
    errors.push('Sync interval debe ser al menos 30 segundos');
  }
  
  if (errors.length > 0) {
    console.error('❌ Errores en configuración:', errors);
    throw new Error('Configuración inválida: ' + errors.join(', '));
  }
  
  console.log('✅ Configuración validada correctamente');
  return true;
};