import React, { useState } from 'react';
import { NavLink, Outlet, Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { LogOut, Box, Store, Menu, X, User as UserIcon, Bell } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as LucideIcons from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getIcon = (iconName: string) => {
  // Convert basic names like 'shopping-cart' to 'ShoppingCart'
  const componentName = iconName.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  const Icon = (LucideIcons as any)[componentName] || LucideIcons.HelpCircle;
  return Icon;
};

export const Layout = () => {
  const { user, accessibleModules, logout, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-slate-200 font-sans overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Store size={20} className="text-white" />
            </div>
            <span className="font-bold text-lg text-slate-100 tracking-tight">Tienda El Buen Sabor</span>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Operaciones
          </p>
          {accessibleModules.map((module) => {
            const Icon = getIcon(module.icon);
            return (
              <NavLink
                key={module.path}
                to={module.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-blue-600/10 text-blue-400 font-medium border border-blue-500/20" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent"
                )}
              >
                <Icon size={18} className="group-hover:scale-110 transition-transform duration-200" />
                <span className="text-sm">{module.name}</span>
                {module.readOnly && (
                  <span className="ml-auto text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 uppercase">
                    Solo Lectura
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-inner">
              <UserIcon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">
                {user?.role === 'ADMIN' ? 'Administrador' :
                 user?.role === 'SALES_USER' ? 'Vendedor' :
                 user?.role === 'PURCHASE_USER' ? 'Comprador' :
                 user?.role === 'INVENTORY_USER' ? 'Almacenero' :
                 'Usuario'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 hover:text-red-300 rounded-lg transition-colors border border-transparent hover:border-red-400/20"
          >
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-slate-800 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white p-2 -ml-2 rounded-lg hover:bg-slate-800">
              <Menu size={24} />
            </button>
            
            <div className="hidden sm:block">
              <h2 className="text-lg font-medium text-slate-200 capitalize">
                {location.pathname === '/' ? 'Panel Principal' : (accessibleModules.find(m => m.path === location.pathname)?.name || location.pathname.split('/')[1].replace('-', ' '))}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Ocultamos campana y entorno según requerimiento */}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-[#050505] p-4 sm:p-6 lg:p-8 relative">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};
