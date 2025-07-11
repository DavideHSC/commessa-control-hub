"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReconciliationSummaryData } from "@shared-types/index";

interface ReconciliationSummaryProps {
    summary: ReconciliationSummaryData;
}

export const ReconciliationSummary = ({ summary }: ReconciliationSummaryProps) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Scritture da Processare</p>
                <p className="text-2xl font-bold">{summary.totalScrittureToProcess}</p>
            </div>
            <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Righe Totali Rilevanti</p>
                <p className="text-2xl font-bold">{summary.totalRigheToProcess}</p>
            </div>
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/10">
                <p className="text-sm text-green-600 dark:text-green-400">Riconciliate Automaticamente</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{summary.reconciledAutomatically}</p>
            </div>
            <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/10">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Da Rivedere Manualmente</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{summary.needsManualReconciliation}</p>
            </div>
        </div>
    )
} 