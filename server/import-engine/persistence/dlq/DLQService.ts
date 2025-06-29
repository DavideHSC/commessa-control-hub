import { PrismaClient } from '@prisma/client';

// =============================================================================
// DEAD LETTER QUEUE SERVICE
// =============================================================================
// Gestisce la raccolta, l'archiviazione e il recupero degli errori
// durante i processi di importazione. Permette analisi diagnostiche
// e potenziale recovery dei record falliti.
// =============================================================================

export interface ImportErrorDetails {
  jobId: string;
  sourceFile: string;
  rowNumber: number;
  rawData: unknown;
  errorStage: 'parsing' | 'validation' | 'transformation' | 'persistence';
  errorMessage: string;
  errorDetails?: unknown;
}

export class DLQService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Registra un errore nella Dead Letter Queue
   */
  async logError(
    jobId: string,
    sourceFile: string,
    rowNumber: number,
    rawData: unknown,
    errorStage: ImportErrorDetails['errorStage'],
    error: unknown
  ): Promise<void> {
    try {
      // Usa ImportLog come DLQ temporanea
      await this.prisma.importLog.create({
        data: {
          templateName: `DLQ_${errorStage}`,
          fileName: sourceFile,
          status: 'ERROR',
          details: JSON.stringify({
            jobId,
            rowNumber,
            rawData,
            errorStage,
            errorMessage: error instanceof Error ? error.message : String(error),
            errorDetails: error instanceof Error ? {
              name: error.name,
              stack: error.stack,
            } : undefined,
          }),
          rowCount: 1,
        },
      });
    } catch (dlqError) {
      // Se non riusciamo a salvare l'errore, almeno loggiamo in console
      console.error('Failed to log error to DLQ:', dlqError);
      console.error('Original error:', error);
    }
  }

  /**
   * Conta gli errori per un job specifico
   */
  async countErrorsForJob(jobId: string): Promise<number> {
    return await this.prisma.importLog.count({
      where: { 
        status: 'ERROR',
        details: {
          contains: `"jobId":"${jobId}"`
        }
      },
    });
  }

  /**
   * Recupera tutti gli errori per un job specifico
   */
  async getErrorsForJob(jobId: string) {
    return await this.prisma.importLog.findMany({
      where: { 
        status: 'ERROR',
        details: {
          contains: `"jobId":"${jobId}"`
        }
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  /**
   * Recupera errori per analisi (con paginazione)
   */
  async getErrorsForAnalysis(
    page: number = 1,
    pageSize: number = 50,
    filter?: {
      jobId?: string;
      sourceFile?: string;
      errorStage?: ImportErrorDetails['errorStage'];
    }
  ) {
    const where = filter ? {
      jobId: filter.jobId,
      sourceFile: filter.sourceFile,
      errorStage: filter.errorStage,
    } : {};

    const whereClause = {
      status: 'ERROR',
      ...(filter?.sourceFile && { fileName: filter.sourceFile }),
      ...(filter?.jobId && { details: { contains: `"jobId":"${filter.jobId}"` } }),
    };

    const [errors, total] = await Promise.all([
      this.prisma.importLog.findMany({
        where: whereClause,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { timestamp: 'desc' },
      }),
      this.prisma.importLog.count({ where: whereClause }),
    ]);

    return {
      errors,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
} 