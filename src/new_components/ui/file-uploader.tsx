import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';

interface FileUploaderProps {
  onFilesUploaded: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  maxSize?: number; // in bytes
  maxFiles?: number;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesUploaded,
  accept = '*',
  multiple = false,
  disabled = false,
  className = '',
  children,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 10,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const validateFiles = useCallback((files: FileList) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    if (files.length > maxFiles) {
      errors.push(`Massimo ${maxFiles} file consentiti`);
      return { validFiles: [], errors };
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size
      if (file.size > maxSize) {
        errors.push(`${file.name}: File troppo grande (max ${Math.round(maxSize / 1024 / 1024)}MB)`);
        continue;
      }

      // Check file type
      if (accept !== '*' && !accept.split(',').some(type => {
        const trimmedType = type.trim();
        if (trimmedType.startsWith('.')) {
          return file.name.toLowerCase().endsWith(trimmedType.toLowerCase());
        }
        return file.type.match(trimmedType);
      })) {
        errors.push(`${file.name}: Tipo di file non supportato`);
        continue;
      }

      validFiles.push(file);
    }

    return { validFiles, errors };
  }, [accept, maxSize, maxFiles]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    const { validFiles, errors } = validateFiles(files);
    
    if (errors.length > 0) {
      alert(errors.join('\n'));
    }
    
    if (validFiles.length > 0) {
      onFilesUploaded(validFiles);
    }
  }, [disabled, validateFiles, onFilesUploaded]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragActive(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const { validFiles, errors } = validateFiles(files);
    
    if (errors.length > 0) {
      alert(errors.join('\n'));
    }
    
    if (validFiles.length > 0) {
      onFilesUploaded(validFiles);
    }

    // Reset input
    e.target.value = '';
  }, [validateFiles, onFilesUploaded]);

  const handleClick = useCallback(() => {
    if (disabled) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = multiple;
    input.onchange = handleFileSelect as any;
    input.click();
  }, [disabled, accept, multiple, handleFileSelect]);

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-lg transition-colors cursor-pointer
        ${isDragActive 
          ? 'border-blue-400 bg-blue-50' 
          : disabled 
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }
        ${className}
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <div className={`p-6 ${disabled ? 'opacity-50' : ''}`}>
        {children || (
          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">
              Carica File
            </h3>
            <p className="text-gray-500 mt-2">
              Trascina qui i file o clicca per selezionare
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {accept !== '*' && `Formati supportati: ${accept}`}
              {maxSize && ` • Max ${Math.round(maxSize / 1024 / 1024)}MB`}
            </p>
          </div>
        )}
      </div>
      
      {isDragActive && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 border-2 border-blue-400 border-dashed rounded-lg flex items-center justify-center">
          <div className="text-blue-600 font-medium">
            Rilascia qui per caricare
          </div>
        </div>
      )}
    </div>
  );
};