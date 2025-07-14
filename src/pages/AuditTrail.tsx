import React from 'react';
import { History } from 'lucide-react';
import { AuditTrail } from '@/components/allocation/AuditTrail';

const AuditTrailPage: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b">
        <div className='flex items-center'>
          <History className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Registro Modifiche</h1>
        </div>
      </header>
      <main className="flex-grow p-4 overflow-auto">
        <AuditTrail />
      </main>
    </div>
  );
};

export default AuditTrailPage;