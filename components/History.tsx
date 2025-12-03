import React, { useState } from 'react';
import { Movimento, TipoMovimento } from '../types';
import { ArrowDownLeft, ArrowUpRight, Sliders, Search } from 'lucide-react';

interface HistoryProps {
  logs: Movimento[];
}

export const History: React.FC<HistoryProps> = ({ logs }) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredLogs = logs
    .filter(log => filterType === 'ALL' || log.tipo === filterType)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Histórico de Movimentos</h2>
        
        <div className="flex bg-white p-1 rounded-lg border border-slate-200">
           <button 
             onClick={() => setFilterType('ALL')}
             className={`px-3 py-1 rounded-md text-sm font-medium ${filterType === 'ALL' ? 'bg-slate-100 text-slate-800' : 'text-slate-500'}`}
           >Todos</button>
           <button 
             onClick={() => setFilterType(TipoMovimento.ENTRADA)}
             className={`px-3 py-1 rounded-md text-sm font-medium ${filterType === TipoMovimento.ENTRADA ? 'bg-green-50 text-green-700' : 'text-slate-500'}`}
           >Entradas</button>
           <button 
             onClick={() => setFilterType(TipoMovimento.SAIDA)}
             className={`px-3 py-1 rounded-md text-sm font-medium ${filterType === TipoMovimento.SAIDA ? 'bg-red-50 text-red-700' : 'text-slate-500'}`}
           >Saídas</button>
           <button 
             onClick={() => setFilterType(TipoMovimento.CORRECAO)}
             className={`px-3 py-1 rounded-md text-sm font-medium ${filterType === TipoMovimento.CORRECAO ? 'bg-blue-50 text-blue-700' : 'text-slate-500'}`}
           >Correções</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Data</th>
                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Tipo</th>
                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Item</th>
                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Qtd.</th>
                <th className="px-6 py-3 font-semibold text-slate-600 text-sm">Motivo/Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => {
                let Icon = Sliders;
                let colorClass = "text-blue-600 bg-blue-100";
                
                if (log.tipo === TipoMovimento.ENTRADA) {
                  Icon = ArrowDownLeft;
                  colorClass = "text-green-600 bg-green-100";
                } else if (log.tipo === TipoMovimento.SAIDA) {
                  Icon = ArrowUpRight;
                  colorClass = "text-red-600 bg-red-100";
                }

                return (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 text-sm text-slate-500 whitespace-nowrap">
                      {formatDate(log.data)}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${colorClass}`}>
                        <Icon size={14} />
                        {log.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-medium text-slate-800">
                      {log.itemNome}
                    </td>
                    <td className="px-6 py-3 font-bold text-slate-700">
                      {log.quantidade > 0 ? `+${log.quantidade}` : log.quantidade}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-500">
                      {log.motivo || '-'}
                    </td>
                  </tr>
                );
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    Sem registos neste período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
