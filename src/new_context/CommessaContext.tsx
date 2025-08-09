import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CommessaUpdate {
  [key: string]: any;
}

interface CommessaContextType {
  updatedCommesse: Record<string, CommessaUpdate>;
  updateCommessa: (id: string, updates: CommessaUpdate) => void;
  getCommessa: (id: string, originalCommessa: any) => any;
  clearUpdates: () => void;
}

const CommessaContext = createContext<CommessaContextType | undefined>(undefined);

export const CommessaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [updatedCommesse, setUpdatedCommesse] = useState<Record<string, CommessaUpdate>>({});

  const updateCommessa = (id: string, updates: CommessaUpdate) => {
    setUpdatedCommesse(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...updates,
        updatedAt: new Date().toISOString()
      }
    }));
  };

  const getCommessa = (id: string, originalCommessa: any) => {
    const updates = updatedCommesse[id];
    if (!updates) return originalCommessa;
    
    return {
      ...originalCommessa,
      ...updates
    };
  };

  const clearUpdates = () => {
    setUpdatedCommesse({});
  };

  return (
    <CommessaContext.Provider value={{
      updatedCommesse,
      updateCommessa,
      getCommessa,
      clearUpdates
    }}>
      {children}
    </CommessaContext.Provider>
  );
};

export const useCommessaContext = () => {
  const context = useContext(CommessaContext);
  if (context === undefined) {
    throw new Error('useCommessaContext must be used within a CommessaProvider');
  }
  return context;
};