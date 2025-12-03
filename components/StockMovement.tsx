import React, { useState, useEffect } from 'react';
import { ItemStock, TipoMovimento } from '../types';
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Search, PlusCircle, MapPin, AlertTriangle, Settings, Plus, Trash2, X, FileText } from 'lucide-react';

interface StockMovementProps {
  items: ItemStock[];
  categories: string[];
  onMovement: (itemId: string, type: TipoMovimento, quantity: number, reason: string) => void;
  onAddItem: (item: Omit<ItemStock, 'id' | 'ultimaAtualizacao'>, motivo?: string) => void;
  onAddCategory: (category: string) => void;
  onRemoveCategory: (category: string) => void;
}

export const StockMovement: React.FC<StockMovementProps> = ({ items, categories, onMovement, onAddItem, onAddCategory, onRemoveCategory }) => {
  const [activeTab, setActiveTab] = useState<'ENTRADA' | 'SAIDA'>('ENTRADA');
  
  // Input States
  const [itemNameInput, setItemNameInput] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  
  // Transaction States
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  
  // New Item States (only for ENTRADA)
  const [newItemCategory, setNewItemCategory] = useState<string>(categories[0] || 'Geral');
  const [newItemLocation, setNewItemLocation] = useState('');
  const [newItemMinStock, setNewItemMinStock] = useState(5);
  const [newItemRef, setNewItemRef] = useState('');

  // Category Management State
  const [showCatManager, setShowCatManager] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const [successMsg, setSuccessMsg] = useState('');

  // Reset fields when tab changes
  useEffect(() => {
    setItemNameInput('');
    setSelectedItemId(null);
    setQuantity(1);
    setReason('');
  }, [activeTab]);

  // Update default category if list changes
  useEffect(() => {
    if (categories.length > 0 && !categories.includes(newItemCategory)) {
      setNewItemCategory(categories[0]);
    }
  }, [categories, newItemCategory]);

  // Check if input matches an existing item exactly
  useEffect(() => {
    const match = items.find(i => i.nome.toLowerCase() === itemNameInput.trim().toLowerCase());
    if (match) {
      setSelectedItemId(match.id);
    } else {
      setSelectedItemId(null);
    }
  }, [itemNameInput, items]);

  const isNewItem = activeTab === 'ENTRADA' && itemNameInput.trim().length > 0 && !selectedItemId;
  const currentItem = items.find(i => i.id === selectedItemId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemNameInput) return;

    let targetId = selectedItemId;

    // 1. If it's a new item (ENTRADA only), create it first
    if (activeTab === 'ENTRADA' && isNewItem) {
      onAddItem({
        nome: itemNameInput,
        categoria: newItemCategory,
        quantidade: quantity,
        stockMinimo: newItemMinStock,
        localizacao: newItemLocation,
        referencia: newItemRef
      }, reason || 'Entrada Inicial (Novo Item)');

      setSuccessMsg(`Novo item criado: ${itemNameInput} (+${quantity})`);
    } else {
      // Existing Item
      if (targetId) {
        onMovement(targetId, activeTab === 'ENTRADA' ? TipoMovimento.ENTRADA : TipoMovimento.SAIDA, quantity, reason);
        setSuccessMsg(`Movimento registado: ${quantity}x ${currentItem?.nome} (${activeTab})`);
      }
    }
    
    // Reset Form
    setItemNameInput('');
    setQuantity(1);
    setReason('');
    setNewItemLocation('');
    setNewItemRef('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      onAddCategory(newCatName.trim());
      setNewCatName('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
         <h2 className="text-2xl font-bold text-slate-800">Registo de Movimentos</h2>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
        <button
          onClick={() => setActiveTab('ENTRADA')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
            activeTab === 'ENTRADA' 
              ? 'bg-green-100 text-green-700 shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <ArrowDownLeft size={20} />
          <span>Dar Entrada</span>
        </button>
        <button
          onClick={() => setActiveTab('SAIDA')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
            activeTab === 'SAIDA' 
              ? 'bg-red-100 text-red-700 shadow-sm' 
              : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <ArrowUpRight size={20} />
          <span>Dar Saída</span>
        </button>
      </div>

      {/* Category Manager Toggle (Only in Entrada) */}
      {activeTab === 'ENTRADA' && (
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <button 
              onClick={() => setShowCatManager(!showCatManager)}
              className="w-full flex items-center justify-between px-6 py-3 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                 <Settings size={18} />
                 <span className="font-medium text-sm">Gerir Categorias</span>
              </div>
              <span className="text-xs text-slate-400">{showCatManager ? 'Fechar' : 'Expandir'}</span>
            </button>
            
            {showCatManager && (
              <div className="p-6 pt-0 bg-slate-50 border-t border-slate-100">
                 <div className="flex flex-wrap gap-2 mb-4">
                    {categories.map(cat => (
                      <span key={cat} className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-full text-xs text-slate-700">
                        {cat}
                        <button onClick={() => onRemoveCategory(cat)} className="text-slate-400 hover:text-red-600 rounded-full hover:bg-red-50 p-0.5"><X size={12} /></button>
                      </span>
                    ))}
                 </div>
                 <form onSubmit={handleAddCategorySubmit} className="flex gap-2">
                    <input 
                      type="text" 
                      value={newCatName}
                      onChange={e => setNewCatName(e.target.value)}
                      placeholder="Nova categoria..." 
                      className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button type="submit" className="bg-slate-800 text-white px-3 py-2 rounded-lg hover:bg-slate-700 text-sm font-medium">
                       Adicionar
                    </button>
                 </form>
              </div>
            )}
         </div>
      )}

      <div className={`p-8 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden bg-white`}>
        {activeTab === 'ENTRADA' && <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>}
        {activeTab === 'SAIDA' && <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>}

        <form onSubmit={handleSubmit} className="space-y-6 pl-4">
          
          {/* ITEM NAME INPUT - SEARCH OR CREATE */}
          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nome do Artigo
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                list="items-suggestions"
                value={itemNameInput}
                onChange={(e) => setItemNameInput(e.target.value)}
                placeholder={activeTab === 'ENTRADA' ? "Escreva para pesquisar ou criar novo..." : "Pesquise o item para saída..."}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                required
                autoComplete="off"
              />
              <datalist id="items-suggestions">
                {items.map(item => (
                  <option key={item.id} value={item.nome}>
                    {item.categoria} | Stock: {item.quantidade} | Loc: {item.localizacao}
                  </option>
                ))}
              </datalist>
            </div>
            
            {/* Status Indicator */}
            <div className="mt-2 min-h-[20px]">
              {selectedItemId && currentItem && (
                 <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded border border-green-100">
                    <CheckCircle2 size={16} />
                    <span>Item identificado: <b>{currentItem.nome}</b> (Stock Atual: {currentItem.quantidade})</span>
                 </div>
              )}
              {isNewItem && activeTab === 'ENTRADA' && (
                 <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 p-2 rounded border border-blue-100">
                    <PlusCircle size={16} />
                    <span>Novo item! Será adicionado ao inventário.</span>
                 </div>
              )}
              {activeTab === 'SAIDA' && itemNameInput && !selectedItemId && (
                 <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
                    <AlertTriangle size={16} />
                    <span>Item não encontrado no stock. Verifique o nome.</span>
                 </div>
              )}
            </div>
          </div>

          {/* NEW ITEM FIELDS (Only visible if New Item detected + ENTRADA) */}
          {isNewItem && activeTab === 'ENTRADA' && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4">
               <div className="md:col-span-2">
                 <h3 className="text-sm font-bold text-slate-700 border-b border-slate-200 pb-2 mb-2">Detalhes do Novo Item</h3>
               </div>
               <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Categoria</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-blue-500"
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Stock Mínimo</label>
                  <input 
                    type="number"
                    min="0"
                    value={newItemMinStock}
                    onChange={(e) => setNewItemMinStock(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-blue-500"
                  />
               </div>
               <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Localização</label>
                  <div className="relative">
                    <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text"
                      value={newItemLocation}
                      onChange={(e) => setNewItemLocation(e.target.value)}
                      placeholder="Ex: Armário A"
                      className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-blue-500"
                    />
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Referência (Fixo)</label>
                  <div className="relative">
                    <FileText className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text"
                      value={newItemRef}
                      onChange={(e) => setNewItemRef(e.target.value)}
                      placeholder="Ex: S/N, Modelo"
                      className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-blue-500"
                    />
                  </div>
               </div>
            </div>
          )}

          {/* COMMON FIELDS */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Quantidade</label>
              <input
                type="number"
                min="1"
                max={activeTab === 'SAIDA' && currentItem ? currentItem.quantidade : undefined}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Motivo / Obs (Opcional)</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={activeTab === 'ENTRADA' ? "Fatura, Doação..." : "Utilizador, Projeto..."}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={(!selectedItemId && !isNewItem) || (activeTab === 'SAIDA' && !selectedItemId)}
            className={`w-full py-4 rounded-lg font-bold text-white shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 ${
              (!selectedItemId && !isNewItem) ? 'bg-slate-300 cursor-not-allowed' :
              activeTab === 'ENTRADA' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {activeTab === 'ENTRADA' ? (isNewItem ? 'CRIAR E DAR ENTRADA' : 'ADICIONAR STOCK') : 'REGISTAR SAÍDA'}
          </button>

          {successMsg && (
            <div className="p-4 bg-blue-50 text-blue-800 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
              <CheckCircle2 size={20} className="text-blue-600" />
              {successMsg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};