import React from 'react';
import { ItemStock } from '../types';
import { AlertTriangle, PackageCheck, PackageX, TrendingUp } from 'lucide-react';

interface DashboardProps {
  items: ItemStock[];
}

export const Dashboard: React.FC<DashboardProps> = ({ items }) => {
  const totalItems = items.reduce((acc, item) => acc + item.quantidade, 0);
  const lowStockItems = items.filter(item => item.quantidade <= item.stockMinimo);
  const totalCategories = new Set(items.map(i => i.categoria)).size;
  
  // Data for chart
  const categoryData = items.reduce((acc: any[], item) => {
    const existing = acc.find(x => x.name === item.categoria);
    if (existing) {
      existing.value += item.quantidade;
    } else {
      acc.push({ name: item.categoria, value: item.quantidade });
    }
    return acc;
  }, []);

  // Sort by value (descending)
  categoryData.sort((a, b) => b.value - a.value);

  // Calculate max value for scaling
  const maxValue = Math.max(...categoryData.map(d => d.value), 1);

  const COLORS = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-red-500', 'bg-violet-500', 'bg-pink-500', 'bg-cyan-500', 'bg-indigo-500'];

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800">Visão Geral do Parque Informático</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
            <PackageCheck size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total de Itens</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalItems}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className={`p-4 rounded-full ${lowStockItems.length > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Stock Crítico</p>
            <h3 className={`text-2xl font-bold ${lowStockItems.length > 0 ? 'text-red-600' : 'text-slate-800'}`}>
              {lowStockItems.length} <span className="text-sm font-normal text-slate-400">alertas</span>
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-full">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Categorias Ativas</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalCategories}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-orange-100 text-orange-600 rounded-full">
            <PackageX size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Itens a Zero</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {items.filter(i => i.quantidade === 0).length}
            </h3>
          </div>
        </div>
      </div>

      {/* Custom CSS Chart & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-700 mb-6">Distribuição por Categoria</h3>
          
          <div className="flex-1 min-h-[300px] flex items-end justify-around gap-2 sm:gap-4 px-2 pt-8 pb-2 border-b border-slate-100">
            {categoryData.length === 0 ? (
               <div className="w-full text-center text-slate-400 self-center">Sem dados para apresentar</div>
            ) : (
              categoryData.map((cat, index) => {
                const heightPercentage = (cat.value / maxValue) * 100;
                // Ensure at least a tiny bar is visible if value > 0
                const displayHeight = cat.value > 0 ? Math.max(heightPercentage, 2) : 0;
                
                return (
                  <div key={cat.name} className="flex flex-col items-center justify-end w-full group relative h-full">
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded pointer-events-none whitespace-nowrap z-10">
                      {cat.name}: {cat.value}
                    </div>
                    
                    {/* Bar */}
                    <div 
                      className={`w-full max-w-[40px] rounded-t-md transition-all duration-500 ${COLORS[index % COLORS.length]} hover:opacity-80`}
                      style={{ height: `${displayHeight}%` }}
                    ></div>
                    
                    {/* Label */}
                    <div className="mt-2 text-xs text-slate-500 font-medium truncate w-full text-center max-w-[60px]" title={cat.name}>
                      {cat.name.split(' ')[0]}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Atenção Necessária</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {lowStockItems.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <PackageCheck size={40} className="mx-auto mb-2 opacity-50" />
                <p>Tudo operacional. Nenhum stock baixo.</p>
              </div>
            ) : (
              lowStockItems.map(item => (
                <div key={item.id} className="p-3 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
                  <p className="font-medium text-slate-800">{item.nome}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-slate-500 bg-white/50 px-1 rounded">{item.categoria}</span>
                    <span className="text-sm font-bold text-red-600">
                      {item.quantidade} <span className="text-xs font-normal text-slate-600">/ min {item.stockMinimo}</span>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};