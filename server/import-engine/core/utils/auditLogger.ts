/**
 * Audit Logger per tracciabilità completa operazioni di finalizzazione
 */

export interface AuditEntry {
  timestamp: string;
  operation: string;
  details: Record<string, any>;
  duration?: number;
  status: 'START' | 'SUCCESS' | 'ERROR';
  error?: string;
}

class AuditLogger {
  private entries: AuditEntry[] = [];

  /**
   * Log inizio operazione
   */
  logStart(operation: string, details: Record<string, any> = {}): string {
    const timestamp = new Date().toISOString();
    const entry: AuditEntry = {
      timestamp,
      operation,
      details,
      status: 'START'
    };
    
    this.entries.push(entry);
    console.log(`[AUDIT] ${timestamp} - START: ${operation}`, details);
    
    return timestamp; // Restituisce timestamp per correlazione
  }

  /**
   * Log successo operazione
   */
  logSuccess(operation: string, startTimestamp: string, details: Record<string, any> = {}): void {
    const timestamp = new Date().toISOString();
    const startTime = new Date(startTimestamp).getTime();
    const endTime = new Date(timestamp).getTime();
    const duration = endTime - startTime;

    const entry: AuditEntry = {
      timestamp,
      operation,
      details,
      duration,
      status: 'SUCCESS'
    };
    
    this.entries.push(entry);
    console.log(`[AUDIT] ${timestamp} - SUCCESS: ${operation} (${duration}ms)`, details);
  }

  /**
   * Log errore operazione
   */
  logError(operation: string, startTimestamp: string, error: Error | string, details: Record<string, any> = {}): void {
    const timestamp = new Date().toISOString();
    const startTime = new Date(startTimestamp).getTime();
    const endTime = new Date(timestamp).getTime();
    const duration = endTime - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    const entry: AuditEntry = {
      timestamp,
      operation,
      details,
      duration,
      status: 'ERROR',
      error: errorMessage
    };
    
    this.entries.push(entry);
    console.error(`[AUDIT] ${timestamp} - ERROR: ${operation} (${duration}ms) - ${errorMessage}`, details);
  }

  /**
   * Log operazione atomica (senza durata)
   */
  logInfo(operation: string, details: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    const entry: AuditEntry = {
      timestamp,
      operation,
      details,
      status: 'SUCCESS'
    };
    
    this.entries.push(entry);
    console.log(`[AUDIT] ${timestamp} - INFO: ${operation}`, details);
  }

  /**
   * Genera report di audit completo
   */
  generateReport(): {
    summary: {
      totalOperations: number;
      successCount: number;
      errorCount: number;
      totalDuration: number;
    };
    entries: AuditEntry[];
  } {
    const summary = {
      totalOperations: this.entries.length,
      successCount: this.entries.filter(e => e.status === 'SUCCESS').length,
      errorCount: this.entries.filter(e => e.status === 'ERROR').length,
      totalDuration: this.entries.reduce((sum, e) => sum + (e.duration || 0), 0)
    };

    return {
      summary,
      entries: [...this.entries]
    };
  }

  /**
   * Pulisce log entries per nuova sessione
   */
  clearLog(): void {
    this.entries = [];
    console.log('[AUDIT] Log audit pulito per nuova sessione');
  }
}

// Singleton instance per condivisione tra moduli
export const auditLogger = new AuditLogger();

// Helper functions per uso semplificato
export const auditStart = (operation: string, details?: Record<string, any>) => 
  auditLogger.logStart(operation, details);

export const auditSuccess = (operation: string, startTimestamp: string, details?: Record<string, any>) => 
  auditLogger.logSuccess(operation, startTimestamp, details);

export const auditError = (operation: string, startTimestamp: string, error: Error | string, details?: Record<string, any>) => 
  auditLogger.logError(operation, startTimestamp, error, details);

export const auditInfo = (operation: string, details: Record<string, any>) => 
  auditLogger.logInfo(operation, details);

export const generateAuditReport = () => auditLogger.generateReport();
export const clearAuditLog = () => auditLogger.clearLog();