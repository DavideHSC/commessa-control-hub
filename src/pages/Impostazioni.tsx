import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ContiRelevanceForm from "@/components/admin/ContiRelevanceForm"
import VociAnaliticheManager from "@/components/admin/VociAnaliticheManager"
import { RegoleRipartizioneManager } from "@/components/admin/RegoleRipartizioneManager"

export default function Impostazioni() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Impostazioni</h1>
      
      <Tabs defaultValue="voci-analitiche" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="voci-analitiche">Voci Analitiche e Mapping</TabsTrigger>
          <TabsTrigger value="conti-rilevanti">Configurazione Conti per Analitica</TabsTrigger>
          <TabsTrigger value="regole-ripartizione">Regole di Ripartizione</TabsTrigger>
        </TabsList>
        <TabsContent value="voci-analitiche">
          <VociAnaliticheManager />
        </TabsContent>
        <TabsContent value="conti-rilevanti">
          <ContiRelevanceForm />
        </TabsContent>
        <TabsContent value="regole-ripartizione">
          <RegoleRipartizioneManager />
        </TabsContent>
      </Tabs>
    </div>
  )
} 