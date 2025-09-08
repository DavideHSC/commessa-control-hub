import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, FileText } from 'lucide-react';

interface FieldsEditorProps {
  fieldDefinitions: any[];
  onChange: (fields: any[]) => void;
  fullHeight?: boolean;
}

export const FieldsEditor: React.FC<FieldsEditorProps> = ({ fieldDefinitions, onChange, fullHeight = false }) => {
  const updateField = (index: number, updates: any) => {
    const updatedFields = [...fieldDefinitions];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    onChange(updatedFields);
  };

  const removeField = (index: number) => {
    const updatedFields = fieldDefinitions.filter((_, i) => i !== index);
    onChange(updatedFields);
  };

  if (!fieldDefinitions || fieldDefinitions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
        <FileText size={24} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nessun campo definito</p>
        <p className="text-xs">Clicca "Aggiungi Campo" per iniziare</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 overflow-y-auto ${fullHeight ? 'flex-1 min-h-0' : 'max-h-64'}`}>
      {fieldDefinitions.map((field: any, index: number) => (
        <div key={index} className="p-4 border rounded-lg bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">Campo {index + 1}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeField(index)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Nome Campo</Label>
              <Input
                value={field.fieldName || ''}
                onChange={(e) => updateField(index, { fieldName: e.target.value })}
                className="h-8 text-xs"
                placeholder="Es. codiceFiscale"
              />
            </div>
            <div>
              <Label className="text-xs">File Identifier</Label>
              <Input
                value={field.fileIdentifier || ''}
                onChange={(e) => updateField(index, { fileIdentifier: e.target.value })}
                placeholder="Es. PNTESTA.TXT"
                className="h-8 text-xs"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            <div>
              <Label className="text-xs">Inizio</Label>
              <Input
                type="number"
                value={field.start || ''}
                onChange={(e) => {
                  const start = parseInt(e.target.value) || 1;
                  updateField(index, { 
                    start,
                    end: start + (field.length || 1) - 1
                  });
                }}
                className="h-8 text-xs"
                min="1"
              />
            </div>
            <div>
              <Label className="text-xs">Lunghezza</Label>
              <Input
                type="number"
                value={field.length || ''}
                onChange={(e) => {
                  const length = parseInt(e.target.value) || 1;
                  updateField(index, { 
                    length,
                    end: (field.start || 1) + length - 1
                  });
                }}
                className="h-8 text-xs"
                min="1"
              />
            </div>
            <div>
              <Label className="text-xs">Fine</Label>
              <Input
                type="number"
                value={field.end || ''}
                readOnly
                className="h-8 text-xs bg-gray-100"
              />
            </div>
            <div>
              <Label className="text-xs">Formato</Label>
              <Input
                value={field.format || ''}
                onChange={(e) => updateField(index, { format: e.target.value })}
                placeholder="boolean"
                className="h-8 text-xs"
              />
            </div>
          </div>
          
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            Posizione: {field.start}-{field.end} • Lunghezza: {field.length}
          </div>
        </div>
      ))}
    </div>
  );
};
