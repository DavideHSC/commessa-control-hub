"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportJob = void 0;
var uuid_1 = require("uuid");
var ImportJob = /** @class */ (function () {
    function ImportJob(type) {
        this.id = (0, uuid_1.v4)();
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
    ImportJob.create = function (type, metadata) {
        var job = new ImportJob(type);
        job.metadata = metadata;
        return job;
    };
    /**
     * Avvia il job
     */
    ImportJob.prototype.start = function () {
        this.status = 'running';
        this.metrics.startTime = new Date();
    };
    /**
     * Completa il job con successo
     */
    ImportJob.prototype.complete = function (finalMetrics) {
        this.status = 'completed';
        this.metrics.endTime = new Date();
        this.metrics.duration = this.metrics.endTime.getTime() - this.metrics.startTime.getTime();
        if (finalMetrics) {
            Object.assign(this.metrics, finalMetrics);
        }
    };
    /**
     * Segna il job come fallito
     */
    ImportJob.prototype.fail = function (error) {
        this.status = 'failed';
        this.error = error;
        this.metrics.endTime = new Date();
        this.metrics.duration = this.metrics.endTime.getTime() - this.metrics.startTime.getTime();
    };
    /**
     * Cancella il job
     */
    ImportJob.prototype.cancel = function () {
        this.status = 'cancelled';
        this.metrics.endTime = new Date();
        this.metrics.duration = this.metrics.endTime.getTime() - this.metrics.startTime.getTime();
    };
    /**
     * Aggiorna le metriche durante l'esecuzione
     */
    ImportJob.prototype.updateMetrics = function (metrics) {
        Object.assign(this.metrics, metrics);
    };
    /**
     * Restituisce un summary del job
     */
    ImportJob.prototype.getSummary = function () {
        var _a;
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
            errorMessage: (_a = this.error) === null || _a === void 0 ? void 0 : _a.message,
            metadata: this.metadata,
        };
    };
    /**
     * Verifica se il job è terminato
     */
    ImportJob.prototype.isFinished = function () {
        return ['completed', 'failed', 'cancelled'].includes(this.status);
    };
    /**
     * Verifica se il job è in esecuzione
     */
    ImportJob.prototype.isRunning = function () {
        return this.status === 'running';
    };
    /**
     * Calcola il tasso di successo
     */
    ImportJob.prototype.getSuccessRate = function () {
        var processed = this.metrics.recordsProcessed || 0;
        if (processed === 0)
            return 0;
        return ((this.metrics.recordsSuccessful || 0) / processed) * 100;
    };
    return ImportJob;
}());
exports.ImportJob = ImportJob;
