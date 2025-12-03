import React, { useState } from 'react';
import { ItemStock, Categoria, Movimento, TipoMovimento } from '../types';
import { Plus, Search, Edit2, Trash2, Save, X, History as HistoryIcon, ArrowDownLeft, ArrowUpRight, Sliders, FileText } from 'lucide-react';

interface InventoryProps {
  items: ItemStock[];
  logs: Movimento[];
  categories: string[];
  onAddItem: (item: Omit<ItemStock, 'id' | 'ultimaAtualizacao'>, motivo?: string) => void;
  onUpdateItem: (id: string, updates: Partial<ItemStock>) => void;
  onDeleteItem: (id: string) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ items, logs, categories, onAddItem, onUpdateItem, onDeleteItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('Todas');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  // Selection State
  const [editingItem, setEditingItem] = useState<ItemStock | null>(null);
  const [historyItem, setHistoryItem] = useState<ItemStock | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nome: '',
    categoria: categories[0] || 'Geral',
    quantidade: 0,
    stockMinimo: 5,
    localizacao: '',
    referencia: ''
  });

  const filteredItems = items.filter(item => {
    const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.localizacao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.referencia?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'Todas' || item.categoria === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Filter logs for specific item
  const itemLogs = historyItem 
    ? logs.filter(l => l.itemId === historyItem.id).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    : [];

  const handleOpenModal = (item?: ItemStock) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        nome: item.nome,
        categoria: item.categoria as string,
        quantidade: item.quantidade,
        stockMinimo: item.stockMinimo,
        localizacao: item.localizacao || '',
        referencia: item.referencia || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        nome: '',
        categoria: categories[0] || 'Geral',
        quantidade: 0,
        stockMinimo: 5,
        localizacao: '',
        referencia: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenHistory = (item: ItemStock) => {
    setHistoryItem(item);
    setIsHistoryModalOpen(true);
  };

  const confirmDelete = (id: string) => {
    if (window.confirm('Tem a certeza absoluta que deseja eliminar este item e todo o seu registo de stock atual?')) {
      onDeleteItem(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      onUpdateItem(editingItem.id, formData);
    } else {
      onAddItem(formData);
    }
    setIsModalOpen(false);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Inventário IT</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={20} />
          <span>Novo Item</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Pesquisar por nome, localização, referência..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select 
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="Todas">Todas as Categorias</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Item</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Categoria</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-center">Stock Atual</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Localização</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm">Ref / Obs</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-sm text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const isLow = item.quantidade <= item.stockMinimo;
                const isZero = item.quantidade === 0;
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{item.nome}</div>
                      {isLow && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-1">
                          Min: {item.stockMinimo}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className="px-2 py-1 bg-slate-100 rounded-md text-xs font-medium">
                        {item.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-bold text-sm ${
                        isZero ? 'bg-red-100 text-red-600' : isLow ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {item.quantidade}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {item.localizacao || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                      {item.referencia ? (
                        <span className="flex items-center gap-1 text-slate-600">
                           <FileText size={14} className="text-slate-400" />
                           {item.referencia}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenHistory(item)}
                          title="Ver Movimentos"
                          className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <HistoryIcon size={18} />
                        </button>
                        <button 
                          onClick={() => handleOpenModal(item)}
                          title="Editar / Corrigir Stock"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => confirmDelete(item.id)}
                          title="Eliminar"
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    Nenhum item encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">
                {editingItem ? 'Editar / Corrigir Item' : 'Novo Item de Inventário'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Item</label>
                <input 
                  required
                  type="text" 
                  value={formData.nome}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: Cabo HDMI 2m"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                <select 
                  value={formData.categoria}
                  onChange={e => setFormData({...formData, categoria: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {categories.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Stock Atual
                    {editingItem && <span className="ml-1 text-xs font-normal text-blue-600">(Correção direta)</span>}
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.quantidade}
                    onChange={e => setFormData({...formData, quantidade: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    {editingItem ? "Alterar aqui não gera registo no histórico." : "Saldo inicial"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock Mínimo</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.stockMinimo}
                    onChange={e => setFormData({...formData, stockMinimo: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Localização</label>
                <input 
                  type="text" 
                  value={formData.localizacao}
                  onChange={e => setFormData({...formData, localizacao: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: Armário B, Prateleira 2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Referência / Observações (Opcional)</label>
                <input 
                  type="text" 
                  value={formData.referencia}
                  onChange={e => setFormData({...formData, referencia: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: S/N 12345, Modelo X1"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2"
                >
                  <Save size={18} />
                  {editingItem ? 'Guardar' : 'Criar Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Item History - reused with minor layout check */}
      {isHistoryModalOpen && historyItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-lg text-slate-800">Histórico de Movimentos</h3>
                <p className="text-sm text-slate-500">{historyItem.nome} ({historyItem.categoria})</p>
              </div>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="overflow-y-auto p-0 flex-1">
              {itemLogs.length === 0 ? (
                <div className="p-10 text-center text-slate-400">
                  <HistoryIcon size={48} className="mx-auto mb-3 opacity-20" />
                  <p>Sem registo de movimentos para este item.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-slate-600 text-xs uppercase">Data</th>
                      <th className="px-6 py-3 font-semibold text-slate-600 text-xs uppercase">Tipo</th>
                      <th className="px-6 py-3 font-semibold text-slate-600 text-xs uppercase text-right">Qtd</th>
                      <th className="px-6 py-3 font-semibold text-slate-600 text-xs uppercase">Motivo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {itemLogs.map(log => {
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
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${colorClass}`}>
                              <Icon size={12} />
                              {log.tipo}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm font-bold text-right text-slate-700">
                            {log.quantidade > 0 ? `+${log.quantidade}` : log.quantidade}
                          </td>
                          <td className="px-6 py-3 text-sm text-slate-500 truncate max-w-[150px]">
                            {log.motivo || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 text-right">
              <button onClick={() => setIsHistoryModalOpen(false)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};