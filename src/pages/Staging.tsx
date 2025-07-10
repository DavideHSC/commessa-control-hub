import { StagingContiTable } from '@/components/database/StagingContiTable';
import { StagingScrittureTable } from '@/components/database/StagingScrittureTable';
import React from 'react';

const StagingPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Visualizzatore Dati di Staging</h1>
      <p className="text-muted-foreground mb-6">
        In questa sezione puoi visualizzare i dati grezzi così come sono stati importati dai file di testo. 
        Questi dati non sono ancora stati validati o collegati al resto del database.
      </p>
      
      <div className="space-y-8">
        <StagingContiTable />
        <StagingScrittureTable />
      </div>
    </div>
  );
};

export default StagingPage; 