import { ReconciliationTable } from "@/components/admin/ReconciliationTable";
import { riconciliazioneColumns } from "@/components/admin/riconciliazione-columns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/api";
import { useState } from "react";
import { ReconciliationResult, RigaDaRiconciliare } from "@shared-types/index";
import { useToast } from "@/hooks/use-toast";
import { ReconciliationSummary } from "@/components/admin/ReconciliationSummary";

export default function Riconciliazione() {
    const [reconciliationResult, setReconciliationResult] = useState<ReconciliationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedScrittura, setSelectedScrittura] = useState<RigaDaRiconciliare | null>(null);
    const { toast } = useToast();

    const handleRunReconciliation = async () => {
        setIsLoading(true);
        setReconciliationResult(null);
        setSelectedScrittura(null);
        try {
            const response = await apiClient.post('/reconciliation/run');
            setReconciliationResult(response.data);
            toast({
                title: "Analisi completata",
                description: "Il processo di riconciliazione è terminato.",
            });
        } catch (error) {
            console.error("Errore durante la riconciliazione:", error);
            toast({
                title: "Errore",
                description: "Si è verificato un errore durante la riconciliazione.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRowClick = (row: RigaDaRiconciliare) => {
        setSelectedScrittura(row);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Riconciliazione Scritture</h1>
            
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle>Avvia Processo di Riconciliazione</CardTitle>
                    <CardDescription>
                        Fai clic sul pulsante qui sotto per avviare l'analisi delle scritture contabili importate
                        e identificare quelle che richiedono un'allocazione manuale.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleRunReconciliation} disabled={isLoading}>
                        {isLoading ? "Analisi in corso..." : "Avvia Analisi"}
                    </Button>
                </CardContent>
            </Card>

            {reconciliationResult && (
                 <Card className="mb-4">
                    <CardHeader>
                        <CardTitle>Riepilogo Analisi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ReconciliationSummary summary={reconciliationResult.summary} />
                    </CardContent>
                </Card>
            )}

            {reconciliationResult && reconciliationResult.righeDaRiconciliare.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Scritture da Riconciliare</CardTitle>
                                <CardDescription>
                                    Seleziona una scrittura per visualizzarne i dettagli e procedere con l'allocazione.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ReconciliationTable
                                    data={reconciliationResult.righeDaRiconciliare}
                                    onRowClick={handleRowClick}
                                    selectedRowId={selectedScrittura?.id}
                                />
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-2">
                        <Card className="sticky top-4">
                            <CardHeader>
                                <CardTitle>Dettaglio Scrittura</CardTitle>
                                <CardDescription>
                                    {selectedScrittura ? `Dettagli per la scrittura ${selectedScrittura.externalId}` : "Seleziona una scrittura per vedere i dettagli"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {selectedScrittura ? (
                                    <div>
                                        <p><strong>ID Esterno:</strong> {selectedScrittura.externalId}</p>
                                        <p><strong>Data:</strong> {new Date(selectedScrittura.data).toLocaleDateString()}</p>
                                        <p><strong>Descrizione:</strong> {selectedScrittura.descrizione}</p>
                                        <p className="mt-4"><strong>Conto:</strong> {selectedScrittura.conto.nome} ({selectedScrittura.conto.codice})</p>
                                        <p><strong>Importo:</strong> {selectedScrittura.importo.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</p>
                                        <p><strong>Voce Analitica Suggerita:</strong> {selectedScrittura.voceAnaliticaSuggerita?.nome || 'N/A'}</p>
                                        
                                        {/* Qui aggiungeremo la tabella con le righe di dettaglio e i form di allocazione */}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-40">
                                        <p className="text-muted-foreground">Nessuna scrittura selezionata</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
} 