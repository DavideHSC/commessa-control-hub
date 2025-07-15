import RegoleRipartizioneManager from "@/components/admin/RegoleRipartizioneManager";

const RegoleRipartizionePage = () => {
    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center justify-between p-4 border-b">
                <div className='flex items-center'>
                    <h1 className="text-2xl font-bold">Gestione Regole di Ripartizione</h1>
                </div>
            </header>
            <main className="flex-grow p-4 overflow-auto">
                <RegoleRipartizioneManager />
            </main>
        </div>
    );
};

export default RegoleRipartizionePage; 