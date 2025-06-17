
import React from 'react';
import { Home, FileText, PlusCircle, BarChart3, Settings, Building2 } from 'lucide-react';
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Commesse",
    url: "/commesse",
    icon: Building2,
  },
  {
    title: "Prima Nota",
    url: "/prima-nota",
    icon: FileText,
  },
  {
    title: "Nuova Registrazione",
    url: "/nuova-registrazione",
    icon: PlusCircle,
  },
  {
    title: "Report",
    url: "/report",
    icon: BarChart3,
  },
  {
    title: "Impostazioni",
    url: "/impostazioni",
    icon: Settings,
  },
];

export function Sidebar() {
  const navigate = useNavigate();

  return (
    <SidebarPrimitive className="border-r border-slate-200 bg-white">
      <SidebarHeader className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 text-lg">CommessaHub</h2>
            <p className="text-xs text-slate-500">Gestione Contabilità</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">
            Navigazione
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className="hover:bg-slate-100 rounded-lg transition-colors duration-200"
                  >
                    <button
                      onClick={() => navigate(item.url)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left"
                    >
                      <item.icon className="w-5 h-5 text-slate-600" />
                      <span className="text-slate-700 font-medium">{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarPrimitive>
  );
}
