import React from 'react';
import { CheckCircleIcon, AlertIcon } from './icons';
import { FILE_DEFINITIONS, FileType } from '../App';

interface FileStatusProps {
    validationStatus: Record<FileType, { status: 'missing' | 'valid' | 'invalid'; message?: string; fileName?: string }>;
}

export const FileStatus: React.FC<FileStatusProps> = ({ validationStatus }) => {
    return (
        <div>
            <h3 className="text-lg font-semibold text-white mb-2">Stato dei File</h3>
            <p className="text-sm text-gray-400 mb-4">Assicurati che tutti e quattro i file siano caricati e validati.</p>
            <ul className="space-y-3">
                {Object.entries(FILE_DEFINITIONS).map(([key, def]) => {
                    const fileType = key as FileType;
                    const status = validationStatus[fileType];
                    return (
                        <li key={key} className="flex items-center p-3 bg-gray-700/50 rounded-lg">
                            {status.status === 'valid' && <CheckCircleIcon className="h-6 w-6 text-green-400 flex-shrink-0" />}
                            {status.status === 'missing' && <div className="h-6 w-6 flex-shrink-0 border-2 border-gray-500 rounded-full" />}
                            {status.status === 'invalid' && <AlertIcon className="h-6 w-6 text-red-400 flex-shrink-0" />}
                            
                            <div className="ml-3 flex-grow overflow-hidden">
                                <p className="text-sm font-medium text-gray-200">{def.name}</p>
                                {status.status === 'valid' && <p className="text-xs text-green-400 truncate">{status.fileName}</p>}
                                {status.status === 'missing' && <p className="text-xs text-gray-500">In attesa di caricamento...</p>}
                                {status.status === 'invalid' && <p className="text-xs text-red-400 truncate">{status.message}</p>}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};