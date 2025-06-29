"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryService = void 0;
var TelemetryService = /** @class */ (function () {
    function TelemetryService() {
        this.events = [];
    }
    /**
     * Logga l'inizio di un job
     */
    TelemetryService.prototype.logJobStart = function (job) {
        this.log('info', job.id, "Job ".concat(job.type, " started"), {
            jobType: job.type,
            metadata: job.metadata,
        });
    };
    /**
     * Logga il completamento con successo di un job
     */
    TelemetryService.prototype.logJobSuccess = function (job, finalStats) {
        this.log('info', job.id, "Job ".concat(job.type, " completed successfully"), {
            jobType: job.type,
            duration: job.metrics.duration,
            stats: finalStats,
            successRate: job.getSuccessRate(),
        });
    };
    /**
     * Logga un errore nel job
     */
    TelemetryService.prototype.logJobError = function (job, error) {
        this.log('error', job.id, "Job ".concat(job.type, " failed"), {
            jobType: job.type,
            duration: job.metrics.duration,
            errorMessage: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined,
        });
    };
    /**
     * Logga informazioni generali
     */
    TelemetryService.prototype.logInfo = function (jobId, message, metadata) {
        this.log('info', jobId, message, metadata);
    };
    /**
     * Logga warning
     */
    TelemetryService.prototype.logWarning = function (jobId, message, metadata) {
        this.log('warn', jobId, message, metadata);
    };
    /**
     * Logga errori
     */
    TelemetryService.prototype.logError = function (jobId, message, error) {
        this.log('error', jobId, message, {
            errorMessage: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined,
        });
    };
    /**
     * Logga debug information
     */
    TelemetryService.prototype.logDebug = function (jobId, message, metadata) {
        this.log('debug', jobId, message, metadata);
    };
    /**
     * Metodo base per logging
     */
    TelemetryService.prototype.log = function (level, jobId, message, metadata) {
        var event = {
            timestamp: new Date(),
            level: level,
            jobId: jobId,
            message: message,
            metadata: metadata,
        };
        this.events.push(event);
        // Log anche in console per sviluppo
        var logMessage = "[".concat(event.timestamp.toISOString(), "] [").concat(level.toUpperCase(), "] [").concat(jobId, "] ").concat(message);
        switch (level) {
            case 'error':
                if (metadata)
                    console.error(logMessage, metadata);
                else
                    console.error(logMessage);
                break;
            case 'warn':
                if (metadata)
                    console.warn(logMessage, metadata);
                else
                    console.warn(logMessage);
                break;
            case 'info':
                if (metadata)
                    console.log(logMessage, metadata);
                else
                    console.log(logMessage);
                break;
            case 'debug':
                if (metadata)
                    console.debug(logMessage, metadata);
                else
                    console.debug(logMessage);
                break;
        }
    };
    /**
     * Recupera eventi per un job specifico
     */
    TelemetryService.prototype.getEventsForJob = function (jobId) {
        return this.events.filter(function (event) { return event.jobId === jobId; });
    };
    /**
     * Recupera eventi per livello
     */
    TelemetryService.prototype.getEventsByLevel = function (level) {
        return this.events.filter(function (event) { return event.level === level; });
    };
    /**
     * Pulisce eventi vecchi (mantiene solo gli ultimi N)
     */
    TelemetryService.prototype.cleanup = function (maxEvents) {
        if (maxEvents === void 0) { maxEvents = 1000; }
        if (this.events.length > maxEvents) {
            this.events = this.events.slice(-maxEvents);
        }
    };
    /**
     * Restituisce statistiche di telemetria
     */
    TelemetryService.prototype.getStats = function () {
        var eventsByLevel = this.events.reduce(function (acc, event) {
            acc[event.level] = (acc[event.level] || 0) + 1;
            return acc;
        }, {});
        var recentErrors = this.events
            .filter(function (event) { return event.level === 'error'; })
            .slice(-10); // ultimi 10 errori
        return {
            totalEvents: this.events.length,
            eventsByLevel: eventsByLevel,
            recentErrors: recentErrors,
        };
    };
    return TelemetryService;
}());
exports.TelemetryService = TelemetryService;
