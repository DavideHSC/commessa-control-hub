import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../new_components/ui/Card';
import { Badge } from '../../new_components/ui/Badge';
import { Alert, AlertDescription } from '../../new_components/ui/Alert';
import { FileText, Database, Settings } from 'lucide-react';

// Importiamo il componente esistente
import ImportTemplatesAdmin from '../../components/admin/ImportTemplatesAdmin';

interface TemplateManagementSectionProps {
  refreshTrigger?: number;
}

export const TemplateManagementSection: React.FC<TemplateManagementSectionProps> = ({ 
  refreshTrigger 
}) => {
  return (
    <div className="flex flex-col space-y-6 h-full" style={{ minHeight: '800px' }}>
      {/* Intestazione della sezione */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Settings className="text-blue-600" size={24} />
            Gestione Template di Importazione
          </h3>
          <p className="text-gray-600">
            Configurazione e gestione dei template per il parsing dei file di importazione
          </p>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <Database size={14} className="mr-1" />
          Template Engine
        </Badge>
      </div>

      {/* Alert informativo */}
      <Alert className="border-blue-200 bg-blue-50">
        <FileText className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Template di Parsing:</strong> I template definiscono come interpretare i file a larghezza fissa.
          Ogni template contiene le definizioni dei campi con posizione di inizio, lunghezza e formato.
          Utilizza il parser centrale <code className="bg-blue-100 px-1 py-0.5 rounded text-xs">fixedWidthParser.ts</code> 
          per applicare automaticamente le definizioni dal database.
        </AlertDescription>
      </Alert>

      {/* Statistiche template */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Template Attivi</p>
                <p className="text-2xl font-bold text-blue-600">8+</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Parser Engine</p>
                <p className="text-lg font-semibold text-green-600">Unified</p>
              </div>
              <Database className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Storage</p>
                <p className="text-lg font-semibold text-purple-600">Database</p>
              </div>
              <Settings className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenitore principale con altezza fissa */}
      <Card className="flex-1 min-h-0" style={{ height: '700px' }}>
        <CardHeader className="border-b bg-gray-50 flex-shrink-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="text-gray-600" size={20} />
            Amministrazione Template
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Gestisci template di importazione per tutti i tipi di file supportati dal sistema
          </p>
        </CardHeader>
        <CardContent className="p-6 flex-1 min-h-0">
          {/* Layout principale con ImportTemplatesAdmin ottimizzato */}
          <div className="w-full h-full">
            <ImportTemplatesAdmin />
          </div>
        </CardContent>
      </Card>

      {/* Template Attivi spostato sotto */}
      <Card className="flex-shrink-0">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="text-green-600" size={18} />
            Template Attivi nel Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 text-sm">Contabili</h4>
              <div className="space-y-2">
                <div className="p-2 bg-gray-50 rounded text-xs">
                  <div className="font-mono text-gray-900">scritture_contabili</div>
                  <Badge variant="outline" className="text-xs mt-1">PNTESTA, PNRIGCON, PNRIGIVA</Badge>
                </div>
                <div className="p-2 bg-gray-50 rounded text-xs">
                  <div className="font-mono text-gray-900">anagrafica_clifor</div>
                  <Badge variant="outline" className="text-xs mt-1">A_CLIFOR.TXT</Badge>
                </div>
                <div className="p-2 bg-gray-50 rounded text-xs">
                  <div className="font-mono text-gray-900">piano_dei_conti</div>
                  <Badge variant="outline" className="text-xs mt-1">CONTIGEN.TXT</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 text-sm">Anagrafici</h4>
              <div className="space-y-2">
                <div className="p-2 bg-gray-50 rounded text-xs">
                  <div className="font-mono text-gray-900">condizioni_pagamento</div>
                  <Badge variant="outline" className="text-xs mt-1">CODPAGAM.TXT</Badge>
                </div>
                <div className="p-2 bg-gray-50 rounded text-xs">
                  <div className="font-mono text-gray-900">codici_iva</div>
                  <Badge variant="outline" className="text-xs mt-1">CODICIVA.TXT</Badge>
                </div>
                <div className="p-2 bg-gray-50 rounded text-xs">
                  <div className="font-mono text-gray-900">causali_contabili</div>
                  <Badge variant="outline" className="text-xs mt-1">CAUSALI.TXT</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 text-sm">Sistema</h4>
              <div className="space-y-2">
                <div className="p-2 bg-blue-50 rounded text-xs border border-blue-200">
                  <div className="font-mono text-blue-900">Parser Engine</div>
                  <Badge variant="secondary" className="text-xs mt-1 bg-blue-100 text-blue-800">Unified Core</Badge>
                </div>
                <div className="p-2 bg-green-50 rounded text-xs border border-green-200">
                  <div className="font-mono text-green-900">Storage</div>
                  <Badge variant="secondary" className="text-xs mt-1 bg-green-100 text-green-800">Database-Driven</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
