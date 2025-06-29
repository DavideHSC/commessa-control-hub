import { v4 as uuidv4 } from 'uuid';

// =============================================================================
// IMPORT JOB MANAGEMENT
// =============================================================================
// Gestisce il ciclo di vita dei job di importazione con tracking dello stato,
// metriche di performance e informazioni diagnostiche.
// =============================================================================

export interface ImportJobMetrics {
  startTime: Date;
  endTime?: Date;
  duration?: number;
  recordsProcessed?: number;
  recordsSuccessful?: number;
  recordsFailed?: number;
  filesProcessed?: number;
}

export type ImportJobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export class ImportJob {
  public readonly id: string;
  public readonly type: string;
  public readonly createdAt: Date;
  public status: ImportJobStatus;
  public metrics: ImportJobMetrics;
  public error?: Error;
  public metadata?: Record<string, unknown>;

  private constructor(type: string) {
    this.id = uuidv4();
    this.type = type;
    this.createdAt = new Date();
    this.status = 'pending';
    this.metrics = {
      startTime: new Date(),
    };
  }

  /**
   * Crea un nuovo job di importazione
   */
  static create(type: string, metadata?: Record<string, unknown>): ImportJob {
    const job = new ImportJob(type);
    job.metadata = metadata;
    return job;
  }

  /**
   * Avvia il job
   */
  start(): void {
    this.status = 'running';
    this.metrics.startTime = new Date();
  }

  /**
   * Completa il job con successo
   */
  complete(finalMetrics?: Partial<ImportJobMetrics>): void {
    this.status = 'completed';
    this.metrics.endTime = new Date();
    this.metrics.duration = this.metrics.endTime.getTime() - this.metrics.startTime.getTime();
    
    if (finalMetrics) {
      Object.assign(this.metrics, finalMetrics);
    }
  }

  /**
   * Segna il job come fallito
   */
  fail(error: Error): void {
    this.status = 'failed';
    this.error = error;
    this.metrics.endTime = new Date();
    this.metrics.duration = this.metrics.endTime.getTime() - this.metrics.startTime.getTime();
  }

  /**
   * Cancella il job
   */
  cancel(): void {
    this.status = 'cancelled';
    this.metrics.endTime = new Date();
    this.metrics.duration = this.metrics.endTime.getTime() - this.metrics.startTime.getTime();
  }

  /**
   * Aggiorna le metriche durante l'esecuzione
   */
  updateMetrics(metrics: Partial<ImportJobMetrics>): void {
    Object.assign(this.metrics, metrics);
  }

  /**
   * Restituisce un summary del job
   */
  getSummary() {
    return {
      id: this.id,
      type: this.type,
      status: this.status,
      createdAt: this.createdAt,
      duration: this.metrics.duration,
      recordsProcessed: this.metrics.recordsProcessed || 0,
      recordsSuccessful: this.metrics.recordsSuccessful || 0,
      recordsFailed: this.metrics.recordsFailed || 0,
      filesProcessed: this.metrics.filesProcessed || 0,
      errorMessage: this.error?.message,
      metadata: this.metadata,
    };
  }

  /**
   * Verifica se il job è terminato
   */
  isFinished(): boolean {
    return ['completed', 'failed', 'cancelled'].includes(this.status);
  }

  /**
   * Verifica se il job è in esecuzione
   */
  isRunning(): boolean {
    return this.status === 'running';
  }

  /**
   * Calcola il tasso di successo
   */
  getSuccessRate(): number {
    const processed = this.metrics.recordsProcessed || 0;
    if (processed === 0) return 0;
    return ((this.metrics.recordsSuccessful || 0) / processed) * 100;
  }
} 