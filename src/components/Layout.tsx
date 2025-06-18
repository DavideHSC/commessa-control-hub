import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner"

const Layout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50">
        <Sidebar />
        <main className="flex-1 flex flex-col">
          <div className="flex items-center gap-4 p-4 bg-white border-b border-slate-200">
            <SidebarTrigger className="text-slate-600 hover:text-slate-900" />
          </div>
          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </main>
        <Toaster />
      </div>
    </SidebarProvider>
  );
};

export default Layout;
