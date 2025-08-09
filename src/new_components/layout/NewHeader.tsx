import { Bell, User } from 'lucide-react';
import { Button } from '../ui/Button';

interface NewHeaderProps {
  title?: string;
}

export const NewHeader = ({ title }: NewHeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Title Section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {title || 'CommessaHub'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Sistema di controllo gestionale avanzato
          </p>
        </div>
        
        {/* Actions Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>
          
          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">Amministratore</div>
              <div className="text-xs text-gray-500">admin@commessa.it</div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};