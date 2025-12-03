import React from 'react';
import { ItemStock } from '../types';
import { AlertTriangle, PackageCheck, PackageX, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
      acc.push({ name: item.categoria.split(' ')[0], value: item.quantidade, fullCategory: item.categoria });
    }
    return acc;
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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

      {/* Chart & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-6">Distribuição por Categoria</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Atenção Necessária</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
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
                    <span className="text-xs text-slate-500">{item.categoria}</span>
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
