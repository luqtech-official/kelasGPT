/**
 * Client-side Logger for Frontend Components
 * Provides comprehensive logging for development mode debugging and security monitoring
 */

class ClientLogger {
  constructor(componentName = 'unknown') {
    this.componentName = componentName;
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.enabled = process.env.NODE_ENV === 'development' || typeof window !== 'undefined' && window.localStorage?.getItem('debug') === 'true';
  }

  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  setUser(userId, username) {
    this.userId = userId;
    this.username = username;
  }

  log(level, category, event, data, message) {
    if (!this.enabled) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      event,
      component: this.componentName,
      sessionId: this.sessionId,
      userId: this.userId,
      username: this.username,
      url: typeof window !== 'undefined' ? window.location.href : null,
      data: data || {},
      message: message || `${category}:${event}`
    };

    // Console output with styling
    const style = this.getLogStyle(level, category);
    console.groupCollapsed(`%c[${level.toUpperCase()}] ${category}:${event}`, style);
    console.log('📊 Data:', data);
    console.log('🕐 Time:', logEntry.timestamp);
    console.log('🎯 Component:', this.componentName);
    if (this.userId) console.log('👤 User:', `${this.username} (${this.userId})`);
    console.groupEnd();

    // Store in localStorage for debugging
    this.storeLog(logEntry);

    // Send to server for critical events (in production)
    if (this.shouldSendToServer(level, category)) {
      this.sendToServer(logEntry);
    }
  }

  getLogStyle(level, category) {
    const styles = {
      debug: 'color: #6b7280; font-weight: normal;',
      info: 'color: #3b82f6; font-weight: bold;',
      warn: 'color: #f59e0b; font-weight: bold;',
      error: 'color: #ef4444; font-weight: bold;',
      security: 'color: #dc2626; font-weight: bold; background: #fef2f2;',
      audit: 'color: #7c3aed; font-weight: bold;',
      performance: 'color: #059669; font-weight: bold;'
    };
    
    return styles[level] || styles[category] || styles.info;
  }

  storeLog(logEntry) {
    if (typeof window === 'undefined') return;
    
    try {
      const logs = JSON.parse(localStorage.getItem('clientLogs') || '[]');
      logs.push(logEntry);
      
      // Keep only last 1000 logs
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }
      
      localStorage.setItem('clientLogs', JSON.stringify(logs));
    } catch (error) {
      console.warn('Failed to store log:', error);
    }
  }

  shouldSendToServer(level, category) {
    const criticalEvents = ['error', 'security', 'audit'];
    return criticalEvents.includes(level) || criticalEvents.includes(category);
  }

  async sendToServer(logEntry) {
    if (typeof window === 'undefined') return;
    
    try {
      await fetch('/api/client-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logEntry)
      });
    } catch (error) {
      console.warn('Failed to send log to server:', error);
    }
  }

  // Security Event Logging
  security = {
    authEvent: (data) => this.log('security', 'SECURITY', 'AUTH_EVENT', data),
    suspiciousActivity: (data) => this.log('security', 'SECURITY', 'SUSPICIOUS_ACTIVITY', data),
    inputValidation: (data) => this.log('security', 'SECURITY', 'INPUT_VALIDATION', data),
    sessionEvent: (data) => this.log('security', 'SECURITY', 'SESSION_EVENT', data),
    csrfEvent: (data) => this.log('security', 'SECURITY', 'CSRF_EVENT', data)
  };

  // Audit Trail Logging
  audit = {
    userAction: (data) => this.log('audit', 'AUDIT', 'USER_ACTION', data),
    dataAccess: (data) => this.log('audit', 'AUDIT', 'DATA_ACCESS', data),
    dataModification: (data) => this.log('audit', 'AUDIT', 'DATA_MODIFICATION', data),
    exportAction: (data) => this.log('audit', 'AUDIT', 'EXPORT_ACTION', data),
    navigationEvent: (data) => this.log('audit', 'AUDIT', 'NAVIGATION_EVENT', data)
  };

  // User Interaction Logging
  interaction = {
    click: (data) => this.log('info', 'INTERACTION', 'CLICK', data),
    input: (data) => this.log('debug', 'INTERACTION', 'INPUT', data),
    search: (data) => this.log('info', 'INTERACTION', 'SEARCH', data),
    filter: (data) => this.log('info', 'INTERACTION', 'FILTER', data),
    sort: (data) => this.log('info', 'INTERACTION', 'SORT', data),
    modal: (data) => this.log('debug', 'INTERACTION', 'MODAL', data),
    dropdown: (data) => this.log('debug', 'INTERACTION', 'DROPDOWN', data)
  };

  // Component Lifecycle Logging
  component = {
    mount: (data) => this.log('debug', 'COMPONENT', 'MOUNT', data),
    unmount: (data) => this.log('debug', 'COMPONENT', 'UNMOUNT', data),
    update: (data) => this.log('debug', 'COMPONENT', 'UPDATE', data),
    error: (data) => this.log('error', 'COMPONENT', 'ERROR', data),
    stateChange: (data) => this.log('debug', 'COMPONENT', 'STATE_CHANGE', data)
  };

  // API Call Logging
  api = {
    request: (data) => this.log('info', 'API', 'REQUEST', data),
    response: (data) => this.log('info', 'API', 'RESPONSE', data),
    error: (data) => this.log('error', 'API', 'ERROR', data),
    timeout: (data) => this.log('warn', 'API', 'TIMEOUT', data),
    retry: (data) => this.log('warn', 'API', 'RETRY', data)
  };

  // Performance Logging
  performance = {
    timing: (data) => this.log('performance', 'PERFORMANCE', 'TIMING', data),
    slowOperation: (data) => this.log('warn', 'PERFORMANCE', 'SLOW_OPERATION', data),
    memoryUsage: (data) => this.log('debug', 'PERFORMANCE', 'MEMORY_USAGE', data),
    renderTime: (data) => this.log('debug', 'PERFORMANCE', 'RENDER_TIME', data)
  };

  // Development Debugging
  dev = {
    functionEntry: (data) => this.log('debug', 'DEV', 'FUNCTION_ENTRY', data),
    functionExit: (data) => this.log('debug', 'DEV', 'FUNCTION_EXIT', data),
    conditionalBranch: (data) => this.log('debug', 'DEV', 'CONDITIONAL_BRANCH', data),
    dataTransformation: (data) => this.log('debug', 'DEV', 'DATA_TRANSFORMATION', data),
    hookExecution: (data) => this.log('debug', 'DEV', 'HOOK_EXECUTION', data),
    effectTrigger: (data) => this.log('debug', 'DEV', 'EFFECT_TRIGGER', data)
  };

  // Error Logging
  error = (message, data) => this.log('error', 'ERROR', 'GENERAL', data, message);
  warn = (message, data) => this.log('warn', 'WARN', 'GENERAL', data, message);
  info = (message, data) => this.log('info', 'INFO', 'GENERAL', data, message);
  debug = (message, data) => this.log('debug', 'DEBUG', 'GENERAL', data, message);

  // Utility Methods
  startTiming(operation) {
    const start = performance.now();
    return {
      end: () => {
        const duration = performance.now() - start;
        this.performance.timing({
          operation,
          duration: Math.round(duration),
          component: this.componentName
        });
        return duration;
      }
    };
  }

  trackUserFlow(step, data = {}) {
    this.audit.userAction({
      flowStep: step,
      component: this.componentName,
      timestamp: Date.now(),
      ...data
    });
  }

  trackError(error, context = {}) {
    this.error(error.message, {
      errorName: error.name,
      stack: error.stack,
      context,
      component: this.componentName
    });
  }

  // Debug helpers
  exportLogs() {
    if (typeof window === 'undefined') return null;
    
    const logs = localStorage.getItem('clientLogs');
    if (!logs) return null;
    
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `client-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  clearLogs() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('clientLogs');
    }
  }

  getLogs() {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('clientLogs') || '[]');
  }
}

// Factory function to create logger instances
export function createClientLogger(component) {
  return new ClientLogger(component);
}

// Default export
export default ClientLogger;