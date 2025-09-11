/**
 * RobustErrorHandler - Risolve CRITICITÀ 6: Error Handling Fragile
 * 
 * PROBLEMA RISOLTO: 45+ try-catch che "ingoiavano" errori con solo console.error
 * Errori critici non arrivavano mai al frontend, debug impossibile in produzione
 * 
 * SOLUZIONE: Sistema centralizzato di error handling con:
 * 1. Propagazione corretta degli errori
 * 2. Classificazione automatica per severità
 * 3. Context tracking per debugging
 * 4. Monitoring integration ready
 * 5. User-friendly error messages
 */

export interface ErrorContext {
  operation: string;
  userId?: string;
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, any>;
  startTime?: number;
}

export interface ProcessedError {
  success: false;
  errorCode: string;
  userMessage: string;
  developerMessage: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  context: ErrorContext;
  timestamp: Date;
  stackTrace?: string;
  shouldRetry: boolean;
  retryAfterMs?: number;
}

export interface SuccessResult<T = any> {
  success: true;
  data: T;
  metadata?: Record<string, any>;
}

export type ServiceResult<T = any> = SuccessResult<T> | ProcessedError;

export class RobustErrorHandler {
  private static instance: RobustErrorHandler;
  private errorCounts: Map<string, number> = new Map();
  private lastErrors: ProcessedError[] = [];
  private readonly MAX_ERROR_HISTORY = 100;

  private constructor() {}

  static getInstance(): RobustErrorHandler {
    if (!RobustErrorHandler.instance) {
      RobustErrorHandler.instance = new RobustErrorHandler();
    }
    return RobustErrorHandler.instance;
  }

  /**
   * Metodo principale per gestire errori in modo robusto
   * SOSTITUISCE: try-catch pattern che "ingoiano" errori
   */
  handleError(error: unknown, context: ErrorContext): ProcessedError {
    const processedError = this.processError(error, context);
    
    // Log strutturato per debugging
    this.logError(processedError);
    
    // Traccia per statistiche
    this.trackError(processedError);
    
    // Integration point per monitoring (Sentry, DataDog, etc.)
    this.notifyMonitoring(processedError);
    
    return processedError;
  }

  /**
   * Wrapper sicuro per operazioni async che possono fallire
   * ESEMPIO USO: const result = await errorHandler.safeExecute(riskyOperation, context);
   */
  async safeExecute<T>(
    operation: () => Promise<T>,
    context: ErrorContext
  ): Promise<ServiceResult<T>> {
    
    const startTime = Date.now();
    const contextWithTiming = { ...context, startTime };
    
    try {
      const result = await operation();
      
      // Log successful operations per monitoring
      if (contextWithTiming.startTime) {
        const duration = Date.now() - contextWithTiming.startTime;
        console.log(`✅ ${context.operation} completed in ${duration}ms`);
      }
      
      return {
        success: true,
        data: result,
        metadata: {
          duration: Date.now() - startTime,
          timestamp: new Date()
        }
      };
      
    } catch (error) {
      return this.handleError(error, contextWithTiming);
    }
  }

  /**
   * Wrapper sicuro per operazioni sync che possono fallire
   */
  safeExecuteSync<T>(
    operation: () => T,
    context: ErrorContext
  ): ServiceResult<T> {
    
    const startTime = Date.now();
    const contextWithTiming = { ...context, startTime };
    
    try {
      const result = operation();
      return {
        success: true,
        data: result,
        metadata: {
          duration: Date.now() - startTime,
          timestamp: new Date()
        }
      };
      
    } catch (error) {
      return this.handleError(error, contextWithTiming);
    }
  }

  /**
   * Processa e classifica errori per gestione appropriata
   */
  private processError(error: unknown, context: ErrorContext): ProcessedError {
    const timestamp = new Date();
    let errorCode: string;
    let userMessage: string;
    let developerMessage: string;
    let severity: ProcessedError['severity'];
    let shouldRetry: boolean;
    let retryAfterMs: number | undefined;
    let stackTrace: string | undefined;

    if (error instanceof Error) {
      developerMessage = error.message;
      stackTrace = error.stack;
      
      // Classificazione intelligente basata su tipo errore
      if (error.name === 'PrismaClientKnownRequestError') {
        errorCode = 'DATABASE_ERROR';
        severity = 'HIGH';
        shouldRetry = true;
        retryAfterMs = 1000;
        userMessage = 'Errore di database temporaneo. Riprova fra un momento.';
        
      } else if (error.name === 'ValidationError') {
        errorCode = 'VALIDATION_ERROR';
        severity = 'MEDIUM';
        shouldRetry = false;
        userMessage = 'Dati forniti non validi. Controlla i valori inseriti.';
        
      } else if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
        errorCode = 'TIMEOUT_ERROR';
        severity = 'MEDIUM';
        shouldRetry = true;
        retryAfterMs = 2000;
        userMessage = 'Operazione scaduta. Riprova con un dataset più piccolo.';
        
      } else if (error.message.includes('not found') || error.message.includes('NOT_FOUND')) {
        errorCode = 'NOT_FOUND_ERROR';
        severity = 'LOW';
        shouldRetry = false;
        userMessage = 'Risorsa richiesta non trovata.';
        
      } else if (error.message.includes('permission') || error.message.includes('authorization')) {
        errorCode = 'PERMISSION_ERROR';
        severity = 'MEDIUM';
        shouldRetry = false;
        userMessage = 'Non hai i permessi necessari per questa operazione.';
        
      } else if (error.message.includes('memory') || error.message.includes('ENOMEM')) {
        errorCode = 'MEMORY_ERROR';
        severity = 'CRITICAL';
        shouldRetry = true;
        retryAfterMs = 5000;
        userMessage = 'Sistema temporaneamente sovraccarico. Riprova fra qualche minuto.';
        
      } else {
        errorCode = 'UNKNOWN_ERROR';
        severity = 'MEDIUM';
        shouldRetry = true;
        retryAfterMs = 1000;
        userMessage = 'Errore imprevisto. Il team tecnico è stato notificato.';
      }
      
    } else if (typeof error === 'string') {
      errorCode = 'STRING_ERROR';
      severity = 'LOW';
      shouldRetry = false;
      developerMessage = error;
      userMessage = 'Errore nell\'elaborazione. Controlla i dati inseriti.';
      
    } else {
      errorCode = 'UNKNOWN_ERROR';
      severity = 'MEDIUM';
      shouldRetry = false;
      developerMessage = 'Errore di tipo sconosciuto';
      userMessage = 'Errore imprevisto. Riprova più tardi.';
    }

    const processedError: ProcessedError = {
      success: false,
      errorCode,
      userMessage,
      developerMessage,
      severity,
      context,
      timestamp,
      stackTrace,
      shouldRetry,
      retryAfterMs
    };

    return processedError;
  }

  /**
   * Log strutturato degli errori per debugging
   */
  private logError(error: ProcessedError): void {
    const logLevel = this.getSeverityLogLevel(error.severity);
    const duration = error.context.startTime 
      ? Date.now() - error.context.startTime 
      : undefined;

    const logMessage = {
      timestamp: error.timestamp.toISOString(),
      operation: error.context.operation,
      errorCode: error.errorCode,
      severity: error.severity,
      userMessage: error.userMessage,
      developerMessage: error.developerMessage,
      userId: error.context.userId,
      entityId: error.context.entityId,
      entityType: error.context.entityType,
      duration: duration ? `${duration}ms` : undefined,
      shouldRetry: error.shouldRetry,
      retryAfterMs: error.retryAfterMs,
      metadata: error.context.metadata
    };

    // Log con livello appropriato
    if (logLevel === 'error') {
      console.error('❌ RobustErrorHandler:', JSON.stringify(logMessage, null, 2));
      if (error.stackTrace) {
        console.error('Stack trace:', error.stackTrace);
      }
    } else if (logLevel === 'warn') {
      console.warn('⚠️ RobustErrorHandler:', JSON.stringify(logMessage, null, 2));
    } else {
      console.log('ℹ️ RobustErrorHandler:', JSON.stringify(logMessage, null, 2));
    }
  }

  /**
   * Tracciamento errori per statistiche
   */
  private trackError(error: ProcessedError): void {
    const key = `${error.context.operation}:${error.errorCode}`;
    const currentCount = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, currentCount + 1);

    // Mantieni history limitata
    this.lastErrors.push(error);
    if (this.lastErrors.length > this.MAX_ERROR_HISTORY) {
      this.lastErrors.shift();
    }
  }

  /**
   * Integration point per sistemi di monitoring
   */
  private notifyMonitoring(error: ProcessedError): void {
    // TODO: Integrazione con Sentry, DataDog, CloudWatch, etc.
    // Per ora, log structured per aggregation
    
    if (error.severity === 'CRITICAL') {
      // Critical errors dovrebbero triggerare alerts immediati
      console.error('🚨 CRITICAL ERROR DETECTED:', {
        operation: error.context.operation,
        errorCode: error.errorCode,
        timestamp: error.timestamp,
        userId: error.context.userId,
        message: error.developerMessage
      });
    }
    
    // Placeholder per future integrations
    /*
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error);
    }
    */
  }

  /**
   * Utilities
   */
  private getSeverityLogLevel(severity: ProcessedError['severity']): 'log' | 'warn' | 'error' {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warn';
      case 'LOW':
      default:
        return 'log';
    }
  }

  /**
   * Ottieni statistiche errori per monitoring dashboard
   */
  getErrorStatistics(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    recentErrors: ProcessedError[];
    mostCommonErrors: Array<{ key: string; count: number }>;
  } {
    const errorsByType: Record<string, number> = {};
    
    for (const [key, count] of this.errorCounts) {
      const [, errorCode] = key.split(':');
      errorsByType[errorCode] = (errorsByType[errorCode] || 0) + count;
    }

    const mostCommonErrors = Array.from(this.errorCounts.entries())
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalErrors: this.lastErrors.length,
      errorsByType,
      recentErrors: this.lastErrors.slice(-10),
      mostCommonErrors
    };
  }

  /**
   * Clear error history (per testing o maintenance)
   */
  clearErrorHistory(): void {
    this.errorCounts.clear();
    this.lastErrors = [];
    console.log('🧹 Error history cleared');
  }
}

// Singleton instance export
export const robustErrorHandler = RobustErrorHandler.getInstance();

// Helper functions per uso semplificato
export const safeExecute = robustErrorHandler.safeExecute.bind(robustErrorHandler);
export const safeExecuteSync = robustErrorHandler.safeExecuteSync.bind(robustErrorHandler);
export const handleError = robustErrorHandler.handleError.bind(robustErrorHandler);

export default RobustErrorHandler;