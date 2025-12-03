import React from 'react';
import { LayoutDashboard, Package, ArrowRightLeft, ShoppingCart, History, Server } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const menuItems = [
    { id: 'DASHBOARD', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'INVENTARIO', label: 'Inventário IT', icon: Package },
    { id: 'MOVIMENTOS', label: 'Entradas / Saídas', icon: ArrowRightLeft },
    { id: 'COMPRAS', label: 'O Que Comprar', icon: ShoppingCart },
    { id: 'HISTORICO', label: 'Histórico', icon: History },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl z-10">
      <div className="p-6 flex items-center gap-3 border-b border-slate-700">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Server size={24} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">IT Stock</h1>
          <p className="text-xs text-slate-400">Gestão Profissional</p>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-2">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id as ViewState)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700 text-center text-xs text-slate-500">
        &copy; 2024 IT Dept. v1.0
      </div>
    </div>
  );
};
