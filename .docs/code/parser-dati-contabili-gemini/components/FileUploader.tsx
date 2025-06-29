
import React, { useCallback, useRef } from 'react';
import { UploadIcon } from './icons';

interface FileUploaderProps {
  onFilesSelected: (files: FileList | null) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFilesSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onFilesSelected(event.target.files);
    }
     // Reset the input value to allow re-uploading the same file
     if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }, [onFilesSelected]);

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('border-cyan-400', 'bg-gray-700/50');
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-cyan-400', 'bg-gray-700/50');
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-cyan-400', 'bg-gray-700/50');
    if (event.dataTransfer.files) {
      onFilesSelected(event.dataTransfer.files);
    }
  };
  
  return (
    <div>
        <h3 className="text-lg font-semibold text-white mb-2">Carica File</h3>
        <p className="text-sm text-gray-400 mb-4">Trascina i quattro file .txt richiesti qui sotto, o clicca per cercarli.</p>
        <label
            htmlFor="file-upload"
            className="flex flex-col justify-center items-center w-full h-48 px-4 transition bg-gray-800 border-2 border-gray-600 border-dashed rounded-lg appearance-none cursor-pointer hover:border-gray-500 focus:outline-none"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                id="file-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".txt,text/plain"
                multiple
            />
            <div className="flex flex-col items-center space-y-2 pointer-events-none">
                 <UploadIcon className="h-10 w-10 text-gray-500"/>
                 <span className="font-medium text-gray-400">
                    Trascina i file o <span className="text-cyan-400">clicca per cercare</span>
                </span>
                <p className="text-xs text-gray-500">Supporta il caricamento multiplo di file .txt</p>
            </div>
        </label>
    </div>
  );
};