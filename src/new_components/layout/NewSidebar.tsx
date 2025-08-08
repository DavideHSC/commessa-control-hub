import { useLocation, Link } from 'react-router-dom';
import { 
  Home, 
  Upload, 
  Layers, 
  Building2, 
  Database, 
  Target, 
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const menuItems: MenuItem[] = [
  { title: "Dashboard", url: "/new/dashboard", icon: Home },
  { title: "Import Dati", url: "/new/import", icon: Upload },
  { title: "Staging", url: "/new/staging", icon: Layers },
  { title: "Commesse", url: "/new/commesse", icon: Building2 },
  { title: "Database", url: "/new/database", icon: Database },
  { title: "Riconciliazione", url: "/new/riconciliazione", icon: Target },
  { title: "Impostazioni", url: "/new/settings", icon: Settings },
];

interface NavItemProps {
  item: MenuItem;
  isActive: boolean;
}

const NavItem = ({ item, isActive }: NavItemProps) => {
  const Icon = item.icon;
  
  return (
    <Link
      to={item.url}
      className={cn(
        "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
        "hover:bg-gray-100 hover:text-gray-900",
        isActive 
          ? "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700" 
          : "text-gray-700"
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{item.title}</span>
    </Link>
  );
};

export const NewSidebar = () => {
  const location = useLocation();
  
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-indigo-600" />
          <div>
            <span className="text-xl font-bold text-gray-900">CommessaHub</span>
            <div className="text-sm text-gray-500">Gestione Commesse</div>
          </div>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <NavItem 
            key={item.url}
            item={item}
            isActive={location.pathname === item.url}
          />
        ))}
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-sm text-gray-500 text-center">
          v2.0 Professional
        </div>
      </div>
    </aside>
  );
};