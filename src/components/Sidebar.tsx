import React from 'react';
import { Home, FileText, BarChart3, Settings, Building2, Upload, Database, GitCompareArrows, Layers, ChevronsUpDown, ListTree, SlidersHorizontal } from 'lucide-react'; // Importo l'icona Layers
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
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

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
    title: "Report",
    url: "/report",
    icon: BarChart3,
  },
];

const serviziItems = [
  {
    title: "Importa Dati",
    url: "/import",
    icon: Upload,
  },
  {
    title: "Riconciliazione",
    url: "/riconciliazione",
    icon: GitCompareArrows,
  },
  {
    title: "Database",
    url: "/database",
    icon: Database,
  },
  {
    title: "Dati di Staging",
    url: "/staging",
    icon: Layers, // Uso la nuova icona
  },
];

const settingsSubMenu = [
    {
        title: "Operazioni di Sistema",
        url: "/impostazioni",
        icon: Settings,
    },
    {
        title: "Configurazione Conti",
        url: "/impostazioni/conti",
        icon: SlidersHorizontal,
    },
    {
        title: "Voci Analitiche",
        url: "/impostazioni/voci-analitiche",
        icon: ListTree,
    },
    {
        title: "Regole di Ripartizione",
        url: "/impostazioni/regole-ripartizione",
        icon: GitCompareArrows,
    }
]

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <SidebarPrimitive className="border-r border-slate-200 bg-white">
      <SidebarHeader className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 text-lg">CommessaHub</h2>
            <p className="text-xs text-slate-500">Gestione Commesse</p>
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
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.url)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-100 rounded-lg transition-colors duration-200 ${
                        isActive ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-700'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-600'}`} />
                      <span className={`font-medium`}>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4 pt-4">
            Servizi
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {serviziItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.url)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-100 rounded-lg transition-colors duration-200 ${
                        isActive ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-700'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-600'}`} />
                      <span className={`font-medium`}>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
                <Accordion type="single" collapsible className="w-full" defaultValue={location.pathname.startsWith('/impostazioni') ? 'impostazioni' : ''}>
                    <AccordionItem value="impostazioni" className="border-b-0">
                        <AccordionTrigger className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-100 rounded-lg transition-colors duration-200 text-slate-700 hover:no-underline">
                            <Settings className={`w-5 h-5 text-slate-600`} />
                            <span className={`font-medium`}>Impostazioni</span>
                        </AccordionTrigger>
                        <AccordionContent className="pl-4">
                            {settingsSubMenu.map((item) => {
                                // La logica più specifica è importante qui per i sotto-menu
                                const isActive = location.pathname === item.url;
                                return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                    onClick={() => navigate(item.url)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-100 rounded-lg transition-colors duration-200 ${
                                        isActive ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'text-slate-700'
                                    }`}
                                    >
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-600'}`} />
                                    <span className={`font-medium`}>{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                );
                            })}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </SidebarPrimitive>
  );
}
