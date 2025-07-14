import { ReconciliationTable } from "@/components/admin/ReconciliationTable";
import { riconciliazioneColumns } from "@/components/admin/riconciliazione-columns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/api";
import { useEffect, useState } from "react";
import { ReconciliationResult, RigaDaRiconciliare, Allocazione } from "@shared-types/index";
import { useToast } from "@/hooks/use-toast";
import { ReconciliationSummary } from "@/components/admin/ReconciliationSummary";
import { AllocationForm, SelectItem } from "@/components/admin/AllocationForm";
import { SmartSuggestions } from "@/components/allocation/SmartSuggestions";
import { getCommesseForSelect } from "@/api/commesse";
import { getVociAnalitiche } from "@/api/vociAnalitiche";

export default function Riconciliazione() {
    const [reconciliationResult, setReconciliationResult] = useState<ReconciliationResult | null>(null);
    const [riconciliateCount, setRiconciliateCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedScrittura, setSelectedScrittura] = useState<RigaDaRiconciliare | null>(null);
    const [commesse, setCommesse] = useState<SelectItem[]>([]);
    const [vociAnalitiche, setVociAnalitiche] = useState<SelectItem[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [commesseData, vociAnaliticheResponse] = await Promise.all([
                    getCommesseForSelect(),
                    getVociAnalitiche({ page: 1, limit: 1000 }), // Carica tutte le voci
                ]);
                setCommesse(commesseData.map(c => ({ value: c.id, label: c.nome })));
                setVociAnalitiche(vociAnaliticheResponse.data.map(v => ({ value: v.id, label: v.nome })));
            } catch (error) {
                console.error("Errore nel caricamento dei dati per i select", error);
                toast({
                    title: "Errore di caricamento",
                    description: "Impossibile caricare commesse e voci analitiche.",
                    variant: "destructive",
                });
            }
        };

        fetchData();
    }, [toast]);

    const handleRunReconciliation = async () => {
        setIsLoading(true);
        setReconciliationResult(null);
        setSelectedScrittura(null);
        setRiconciliateCount(0); // Reset contatore
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

    const handleSaveAllocations = async (allocations: Allocazione[]) => {
        if (!selectedScrittura) return;

        try {
            await apiClient.post('/reconciliation/finalize', {
                rigaScritturaId: selectedScrittura.id,
                allocations: allocations,
            });

            // Apprendimento automatico dai suggerimenti applicati
            try {
                await apiClient.post('/smart-allocation/learn', {
                    rigaId: selectedScrittura.id,
                    allocazioni: allocations,
                });
            } catch (learnError) {
                console.warn("Errore nell'apprendimento automatico:", learnError);
            }

            toast({
                title: "Salvataggio completato",
                description: "L'allocazione è stata salvata con successo.",
            });
            
            setRiconciliateCount(prev => prev + 1);
            setReconciliationResult(prev => prev ? ({
                ...prev,
                righeDaRiconciliare: prev.righeDaRiconciliare.filter(r => r.id !== selectedScrittura.id),
            }) : null);
            setSelectedScrittura(null);

        } catch (error) {
            console.error("Errore durante il salvataggio dell'allocazione:", error);
            toast({
                title: "Errore di salvataggio",
                description: "Impossibile salvare l'allocazione.",
                variant: "destructive",
            });
        }
    };

    const handleApplySmartSuggestion = (suggestion: any) => {
        // Applica il suggerimento intelligente precompilando l'AllocationForm
        if (selectedScrittura) {
            const allocation = {
                commessaId: suggestion.commessaId,
                voceAnaliticaId: suggestion.voceAnaliticaId,
                importo: suggestion.percentuale 
                    ? selectedScrittura.importo * (suggestion.percentuale / 100)
                    : selectedScrittura.importo
            };
            
            // Questo sarà gestito dal componente AllocationForm
            toast({
                title: "Suggerimento applicato",
                description: `Applicato suggerimento: ${suggestion.commessaNome}`,
            });
        }
    };

    const summaryWithLiveCount = reconciliationResult ? {
        ...reconciliationResult.summary,
        needsManualReconciliation: reconciliationResult.summary.needsManualReconciliation - riconciliateCount,
        reconciled: (reconciliationResult.summary.reconciledAutomatically || 0) + riconciliateCount,
    } : null;

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

            {summaryWithLiveCount && (
                 <Card className="mb-4">
                    <CardHeader>
                        <CardTitle>Riepilogo Analisi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ReconciliationSummary summary={summaryWithLiveCount} />
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
                    <div className="lg:col-span-2 space-y-4">
                        {/* Suggerimenti Intelligenti */}
                        {selectedScrittura && (
                            <SmartSuggestions
                                rigaId={selectedScrittura.id}
                                contoId={selectedScrittura.conto.id}
                                importo={selectedScrittura.importo}
                                descrizione={selectedScrittura.descrizione}
                                onApplySuggestion={handleApplySmartSuggestion}
                            />
                        )}

                        {/* Dettaglio Scrittura */}
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
                                        
                                        {selectedScrittura.voceAnaliticaSuggerita && (
                                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                                                <p className="text-sm font-semibold text-blue-800">
                                                    <span className="mr-2">💡</span>
                                                    Voce Analitica Suggerita: {selectedScrittura.voceAnaliticaSuggerita.nome}
                                                </p>
                                            </div>
                                        )}
                                        
                                        <div className="mt-4 border-t pt-4">
                                            <AllocationForm
                                                scrittura={selectedScrittura}
                                                commesse={commesse}
                                                vociAnalitiche={vociAnalitiche}
                                                onSave={handleSaveAllocations}
                                            />
                                        </div>
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