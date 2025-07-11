import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUp } from 'lucide-react';
import { FileUploader } from '@/components/ui/file-uploader';
import { useNavigate } from 'react-router-dom';

const IMPORT_TYPES = [
    { value: 'piano-dei-conti', label: 'Piano dei Conti', endpoint: '/api/v2/import/piano-dei-conti' },
    { value: 'scritture-contabili', label: 'Scritture Contabili', endpoint: '/api/v2/import/scritture-contabili' },
    { value: 'anagrafica-clifor', label: 'Anagrafica Clienti/Fornitori', endpoint: '/api/v2/import/anagrafica-clifor' },
    { value: 'anagrafica-causali', label: 'Anagrafica Causali', endpoint: '/api/v2/import/anagrafica-causali' },
    { value: 'anagrafica-iva', label: 'Anagrafica Codici IVA', endpoint: '/api/v2/import/anagrafica-iva' },
    { value: 'anagrafica-pagamenti', label: 'Anagrafica Condizioni di Pagamento', endpoint: '/api/v2/import/anagrafica-pagamenti' },
];

const ImportPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold text-slate-900">Importazione Dati</h1>
                <p className="text-slate-600 mt-1">
                    Trascina o seleziona i file da importare nelle rispettive categorie.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {IMPORT_TYPES.map((type) => (
                    <Card key={type.value}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileUp className="h-6 w-6" />
                                {type.label}
                            </CardTitle>
                             <CardDescription>
                                Importa il file relativo a {type.label.toLowerCase()}.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FileUploader
                                endpoint={type.endpoint}
                                onUploadSuccess={() => navigate('/staging')}
                            />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ImportPage; 