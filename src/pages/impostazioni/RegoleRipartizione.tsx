import RegoleRipartizioneManager from "@/components/admin/RegoleRipartizioneManager";

const RegoleRipartizionePage = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Gestione Regole di Ripartizione</h1>
            <RegoleRipartizioneManager />
        </div>
    );
};

export default RegoleRipartizionePage; 