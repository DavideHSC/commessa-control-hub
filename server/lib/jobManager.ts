import { EventEmitter } from 'events';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Job {
  id: string;
  status: JobStatus;
  progress: number;
  total: number;
  message: string;
  result?: any;
  error?: string;
}

// Usiamo un EventEmitter per notificare gli aggiornamenti di stato
class JobManager extends EventEmitter {
  private jobs = new Map<string, Job>();

  create(jobId: string, total: number) {
    const job: Job = {
      id: jobId,
      status: 'pending',
      progress: 0,
      total,
      message: 'In attesa di avvio...',
    };
    this.jobs.set(jobId, job);
    this.emit('update', job);
    return job;
  }

  update(jobId: string, updates: Partial<Job>) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    // Aggiorna solo i campi forniti
    const updatedJob = { ...job, ...updates };
    this.jobs.set(jobId, updatedJob);
    
    // Emetti un evento per notificare i listener (il nostro endpoint SSE)
    this.emit('update', updatedJob);
  }

  get(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  cleanup(jobId: string) {
    // Rimuovi i job completati dopo un po' per non riempire la memoria
    setTimeout(() => {
      this.jobs.delete(jobId);
      console.log(`[JobManager] Pulito job ${jobId}`);
    }, 60 * 1000); // 1 minuto
  }
}

// Esportiamo una singola istanza (singleton) del nostro manager
export const jobManager = new JobManager(); 