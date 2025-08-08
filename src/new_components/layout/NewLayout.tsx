import { Outlet } from 'react-router-dom';
import { NewSidebar } from './NewSidebar';
import { NewHeader } from './NewHeader';

interface NewLayoutProps {
  title?: string;
}

export const NewLayout = ({ title }: NewLayoutProps) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <NewSidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <NewHeader title={title} />
        
        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};