import ContiRelevanceForm from "@/components/admin/ContiRelevanceForm";

const ConfigurazioneContiPage = () => {
    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center justify-between p-4 border-b">
                <div className='flex items-center'>
                    <h1 className="text-2xl font-bold">Configurazione Conti per Analitica</h1>
                </div>
            </header>
            <main className="flex-grow p-4 overflow-auto">
                <ContiRelevanceForm />
            </main>
        </div>
    );
};

export default ConfigurazioneContiPage; 