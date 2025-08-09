import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import axios from 'axios';

interface FileUploaderProps {
  endpoint: string;
  onUploadSuccess: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ endpoint, onUploadSuccess }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({ title: 'Nessun file selezionato', description: 'Per favore, seleziona almeno un file da caricare.' });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percentCompleted);
        },
      });
      
      toast({ title: 'Successo!', description: response.data.message || 'Importazione completata.' });
      setFiles([]);
      onUploadSuccess();

    } catch (error) {
      const errorMsg = axios.isAxiosError(error) && error.response ? error.response.data.message : 'Si è verificato un errore.';
      toast({ variant: 'destructive', title: 'Errore di Importazione', description: errorMsg });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Rilascia i file qui...</p>
        ) : (
          <p>Trascina i file qui, o clicca per selezionarli</p>
        )}
      </div>

      {files.length > 0 && (
        <div>
          <h4 className="font-semibold">File selezionati:</h4>
          <ul className="list-disc list-inside">
            {files.map((file, i) => (
              <li key={i}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}

      {isUploading && <Progress value={uploadProgress} className="w-full" />}

      <Button onClick={handleUpload} disabled={isUploading || files.length === 0}>
        {isUploading ? `Caricamento... ${uploadProgress}%` : 'Carica File'}
      </Button>
    </div>
  );
}; 