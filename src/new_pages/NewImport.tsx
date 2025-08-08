import { useState } from 'react';
import { useImportScritture } from '../new_hooks/useImportScritture';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

interface ImportFiles {
  pntesta: File;
  pnrigcon: File;
  pnrigiva?: File;
  movanac?: File;
}

export default function NewImport() {
  const { status, progress, error, validationErrors, startImport, reset } = useImportScritture();
  const [files, setFiles] = useState<ImportFiles | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) {
      setFiles(null);
      return;
    }

    const fileMap: { [key: string]: File } = {};
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileName = file.name.toLowerCase();
      
      if (fileName.includes('pntesta')) {
        fileMap.pntesta = file;
      } else if (fileName.includes('pnrigcon')) {
        fileMap.pnrigcon = file;
      } else if (fileName.includes('pnrigiva')) {
        fileMap.pnrigiva = file;
      } else if (fileName.includes('movanac')) {
        fileMap.movanac = file;
      }
    }

    if (fileMap.pntesta && fileMap.pnrigcon) {
      setFiles({
        pntesta: fileMap.pntesta,
        pnrigcon: fileMap.pnrigcon,
        pnrigiva: fileMap.pnrigiva,
        movanac: fileMap.movanac
      });
    } else {
      setFiles(null);
    }
  };

  const handleStartImport = () => {
    if (files) {
      startImport(files);
    }
  };

  const handleReset = () => {
    reset();
    setFiles(null);
  };

  if (status === 'idle') {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Importazione Scritture Contabili</CardTitle>
            <CardDescription>
              Seleziona i file necessari per l'importazione. I file PNTESTA e PNRIGCON sono obbligatori.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="files">Seleziona File</Label>
              <Input
                id="files"
                type="file"
                multiple
                accept=".txt,.TXT"
                onChange={handleFileChange}
                className="mt-2"
              />
            </div>

            {files && (
              <div className="space-y-2">
                <h4 className="font-medium">File selezionati:</h4>
                <ul className="space-y-1">
                  <li className="flex items-center gap-2">
                    <Badge variant="default">PNTESTA</Badge>
                    <span className="text-sm">{files.pntesta.name}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Badge variant="default">PNRIGCON</Badge>
                    <span className="text-sm">{files.pnrigcon.name}</span>
                  </li>
                  {files.pnrigiva && (
                    <li className="flex items-center gap-2">
                      <Badge variant="secondary">PNRIGIVA</Badge>
                      <span className="text-sm">{files.pnrigiva.name}</span>
                    </li>
                  )}
                  {files.movanac && (
                    <li className="flex items-center gap-2">
                      <Badge variant="secondary">MOVANAC</Badge>
                      <span className="text-sm">{files.movanac.name}</span>
                    </li>
                  )}
                </ul>
              </div>
            )}

            <Button
              onClick={handleStartImport}
              disabled={!files}
              className="w-full"
            >
              Avvia Importazione
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'uploading' || status === 'polling') {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Importazione in corso...</CardTitle>
            <CardDescription>
              L'importazione è in corso. Monitora il progresso qui sotto.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm">
                {status === 'uploading' ? 'Caricamento file...' : 'Elaborazione in corso...'}
              </span>
            </div>

            <Progress value={status === 'uploading' ? 25 : 75} className="w-full" />

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Log dell'importazione:</h4>
              <ScrollArea className="h-64 w-full border rounded-md p-4">
                {progress.length === 0 ? (
                  <p className="text-sm text-muted-foreground">In attesa di eventi...</p>
                ) : (
                  <div className="space-y-2">
                    {progress.map((event, index) => (
                      <div key={index} className="text-sm">
                        <span className="text-muted-foreground">[{event.timestamp}]</span>
                        <span className={`ml-2 ${
                          event.level === 'error' ? 'text-destructive' :
                          event.level === 'warning' ? 'text-yellow-600' :
                          'text-foreground'
                        }`}>
                          {event.message}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Importazione completata con successo!</CardTitle>
            <CardDescription>
              L'importazione delle scritture contabili è stata completata senza errori.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Tutti i dati sono stati importati correttamente nel sistema.
              </AlertDescription>
            </Alert>

            <div>
              <h4 className="font-medium mb-2">Log finale:</h4>
              <ScrollArea className="h-32 w-full border rounded-md p-4">
                <div className="space-y-2">
                  {progress.map((event, index) => (
                    <div key={index} className="text-sm">
                      <span className="text-muted-foreground">[{event.timestamp}]</span>
                      <span className="ml-2">{event.message}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <Button onClick={handleReset} className="w-full">
              Inizia una nuova importazione
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Importazione fallita</CardTitle>
            <CardDescription>
              Si è verificato un errore durante l'importazione. Controlla i dettagli qui sotto.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {validationErrors.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Errori di validazione:</h4>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campo</TableHead>
                        <TableHead>Riga</TableHead>
                        <TableHead>Messaggio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationErrors.map((validationError, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{validationError.field}</TableCell>
                          <TableCell>{validationError.row || '-'}</TableCell>
                          <TableCell>{validationError.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {progress.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Log dell'importazione:</h4>
                <ScrollArea className="h-32 w-full border rounded-md p-4">
                  <div className="space-y-2">
                    {progress.map((event, index) => (
                      <div key={index} className="text-sm">
                        <span className="text-muted-foreground">[{event.timestamp}]</span>
                        <span className={`ml-2 ${
                          event.level === 'error' ? 'text-destructive' : 'text-foreground'
                        }`}>
                          {event.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            <Button onClick={handleReset} variant="destructive" className="w-full">
              Riprova
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}