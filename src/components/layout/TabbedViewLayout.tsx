import React, { useState } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface TabConfig {
  key: string;
  label: string;
  icon: React.ElementType;
  component: React.ReactNode;
  count?: number;
}

interface TabbedViewLayoutProps {
  tabs: TabConfig[];
  defaultSelectedTab: string;
  isLoading?: boolean;
}

export const TabbedViewLayout: React.FC<TabbedViewLayoutProps> = ({
  tabs,
  defaultSelectedTab,
  isLoading = false,
}) => {
  const [selectedTab, setSelectedTab] = useState<string>(defaultSelectedTab);

  const activeTab = tabs.find(t => t.key === selectedTab);
  
  // Fallback al primo tab se il tab selezionato non esiste
  const currentTab = activeTab || tabs[0];
  
  console.log('TabbedViewLayout render:', { selectedTab, activeTab: activeTab?.key, currentTab: currentTab?.key, tabsCount: tabs.length });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex h-full rounded-lg border">
      <div className="w-64 border-r bg-gray-50">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Tabelle</h2>
          <nav className="flex flex-col space-y-1">
            {tabs.map(tab => (
              <Button
                key={tab.key}
                variant={selectedTab === tab.key ? "secondary" : "ghost"}
                className={`w-full justify-start ${selectedTab === tab.key ? 'bg-blue-100 border-blue-500' : ''}`}
                onClick={() => {
                  console.log('Switching to tab:', tab.key);
                  setSelectedTab(tab.key);
                }}
              >
                <tab.icon className="mr-2 h-4 w-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <Badge variant="outline" className="ml-auto">
                    {tab.count}
                  </Badge>
                )}
              </Button>
            ))}
          </nav>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="p-4 h-full overflow-auto">
          <div className="overflow-x-auto w-full">
            {isLoading ? (
              <p>Caricamento in corso...</p>
            ) : (
              tabs.find(t => t.key === selectedTab)?.component
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 