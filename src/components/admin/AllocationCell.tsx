import { useEffect, useState } from "react";
import { Row } from "@tanstack/react-table";
import { RigaDaRiconciliare, saveManualAllocation } from "@/api/reconciliation";
import { getCommesseForSelect } from "@/api/commesse";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface CommessaSelectItem {
    id: string;
    nome: string;
}

interface AllocationCellProps {
    row: Row<RigaDaRiconciliare>;
    onSaveSuccess: (rigaId: string) => void;
}

export const AllocationCell = ({ row, onSaveSuccess }: AllocationCellProps) => {
    const { toast } = useToast();
    const [commesse, setCommesse] = useState<CommessaSelectItem[]>([]);
    const [selectedCommessa, setSelectedCommessa] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const rigaData = row.original;
    const importo = rigaData.importoDare ?? rigaData.importoAvere ?? 0;

    useEffect(() => {
        const fetchCommesse = async () => {
            try {
                const data = await getCommesseForSelect();
                setCommesse(data);
            } catch (error) {
                toast({
                    title: "Errore",
                    description: "Impossibile caricare l'elenco delle commesse.",
                    variant: "destructive",
                });
            }
        };
        fetchCommesse();
    }, [toast]);

    const handleSave = async () => {
        if (!selectedCommessa) {
            toast({
                title: "Attenzione",
                description: "Seleziona una commessa.",
                variant: "destructive",
            });
            return;
        }

        if (!rigaData.suggerimentoVoceAnaliticaId) {
            toast({
                title: "Errore",
                description: "Voce analitica suggerita non trovata. Impossibile salvare.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            await saveManualAllocation({
                rigaStagingId: rigaData.id,
                voceAnaliticaId: rigaData.suggerimentoVoceAnaliticaId,
                allocazioni: [{
                    commessaId: selectedCommessa,
                    importo: importo,
                }],
            });

            toast({
                title: "Successo",
                description: "Riga allocata correttamente.",
            });

            onSaveSuccess(rigaData.id);

        } catch (error) {
            toast({
                title: "Errore",
                description: "Si è verificato un errore durante il salvataggio.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center space-x-2">
            <Select onValueChange={setSelectedCommessa} disabled={isLoading}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Seleziona commessa..." />
                </SelectTrigger>
                <SelectContent>
                    {commesse.map(commessa => (
                        <SelectItem key={commessa.id} value={commessa.id}>
                            {commessa.nome}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button onClick={handleSave} disabled={isLoading || !selectedCommessa}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salva
            </Button>
        </div>
    );
}; 