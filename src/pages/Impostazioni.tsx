import ContiRelevanceForm from '@/components/admin/ContiRelevanceForm';
import VociAnaliticheManager from '@/components/admin/VociAnaliticheManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { resetDatabase } from '@/api/index';

const Impostazioni = () => {
  const { toast } = useToast();

  const handleResetDatabase = async () => {
    // ... (existing logic)
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Impostazioni</h1>
      
      <Tabs defaultValue="conti">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="conti">Configurazione Conti</TabsTrigger>
          <TabsTrigger value="voci-analitiche">Gestione Voci Analitiche</TabsTrigger>
        </TabsList>
        <TabsContent value="conti">
          <ContiRelevanceForm />
        </TabsContent>
        <TabsContent value="voci-analitiche">
          <VociAnaliticheManager />
        </TabsContent>
      </Tabs>

      <div className="p-4 border rounded-lg mt-6">
        <h2 className="text-xl font-semibold">Operazioni di Sistema</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Azioni pericolose che possono alterare o eliminare dati in modo permanente.
        </p>
        <Button variant="destructive" onClick={handleResetDatabase}>
          Azzera e Ripopola Database
        </Button>
      </div>
    </div>
  );
};

export default Impostazioni; 