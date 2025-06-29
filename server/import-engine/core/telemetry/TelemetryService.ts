import { ImportJob, ImportJobMetrics } from '../jobs/ImportJob';

// =============================================================================
// TELEMETRY SERVICE
// =============================================================================
// Gestisce logging strutturato, metriche e monitoring per i processi di
// importazione. Fornisce visibilità completa sull'esecuzione dei job.
// =============================================================================

export interface TelemetryEvent {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  jobId: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export class TelemetryService {
  private events: TelemetryEvent[] = [];

  /**
   * Logga l'inizio di un job
   */
  logJobStart(job: ImportJob): void {
    this.log('info', job.id, `Job ${job.type} started`, {
      jobType: job.type,
      metadata: job.metadata,
    });
  }

  /**
   * Logga il completamento con successo di un job
   */
  logJobSuccess(job: ImportJob, finalStats?: unknown): void {
    this.log('info', job.id, `Job ${job.type} completed successfully`, {
      jobType: job.type,
      duration: job.metrics.duration,
      stats: finalStats,
      successRate: job.getSuccessRate(),
    });
  }

  /**
   * Logga un errore nel job
   */
  logJobError(job: ImportJob, error: unknown): void {
    this.log('error', job.id, `Job ${job.type} failed`, {
      jobType: job.type,
      duration: job.metrics.duration,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });
  }

  /**
   * Logga informazioni generali
   */
  logInfo(jobId: string, message: string, metadata?: Record<string, unknown>): void {
    this.log('info', jobId, message, metadata);
  }

  /**
   * Logga warning
   */
  logWarning(jobId: string, message: string, metadata?: Record<string, unknown>): void {
    this.log('warn', jobId, message, metadata);
  }

  /**
   * Logga errori
   */
  logError(jobId: string, message: string, error?: unknown): void {
    this.log('error', jobId, message, {
      errorMessage: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
    });
  }

  /**
   * Logga debug information
   */
  logDebug(jobId: string, message: string, metadata?: Record<string, unknown>): void {
    this.log('debug', jobId, message, metadata);
  }

  /**
   * Metodo base per logging
   */
  private log(
    level: TelemetryEvent['level'],
    jobId: string,
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    const event: TelemetryEvent = {
      timestamp: new Date(),
      level,
      jobId,
      message,
      metadata,
    };

    this.events.push(event);

    // Log anche in console per sviluppo
    const logMessage = `[${event.timestamp.toISOString()}] [${level.toUpperCase()}] [${jobId}] ${message}`;
    
    switch (level) {
      case 'error':
        if (metadata) console.error(logMessage, metadata);
        else console.error(logMessage);
        break;
      case 'warn':
        if (metadata) console.warn(logMessage, metadata);
        else console.warn(logMessage);
        break;
      case 'info':
        if (metadata) console.log(logMessage, metadata);
        else console.log(logMessage);
        break;
      case 'debug':
        if (metadata) console.debug(logMessage, metadata);
        else console.debug(logMessage);
        break;
    }
  }

  /**
   * Recupera eventi per un job specifico
   */
  getEventsForJob(jobId: string): TelemetryEvent[] {
    return this.events.filter(event => event.jobId === jobId);
  }

  /**
   * Recupera eventi per livello
   */
  getEventsByLevel(level: TelemetryEvent['level']): TelemetryEvent[] {
    return this.events.filter(event => event.level === level);
  }

  /**
   * Pulisce eventi vecchi (mantiene solo gli ultimi N)
   */
  cleanup(maxEvents: number = 1000): void {
    if (this.events.length > maxEvents) {
      this.events = this.events.slice(-maxEvents);
    }
  }

  /**
   * Restituisce statistiche di telemetria
   */
  getStats(): {
    totalEvents: number;
    eventsByLevel: Record<string, number>;
    recentErrors: TelemetryEvent[];
  } {
    const eventsByLevel = this.events.reduce((acc, event) => {
      acc[event.level] = (acc[event.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentErrors = this.events
      .filter(event => event.level === 'error')
      .slice(-10); // ultimi 10 errori

    return {
      totalEvents: this.events.length,
      eventsByLevel,
      recentErrors,
    };
  }
} 