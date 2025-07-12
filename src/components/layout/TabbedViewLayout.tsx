import React, { useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Tabelle</h2>
          <nav className="flex flex-col space-y-1">
            {tabs.map(tab => (
              <Button
                key={tab.key}
                variant={selectedTab === tab.key ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedTab(tab.key)}
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
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={80}>
        <div className="p-4 h-full overflow-auto">
          {activeTab ? activeTab.component : <p>Seleziona una tabella</p>}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}; 