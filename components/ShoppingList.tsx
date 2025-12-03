import React, { useState, useEffect } from 'react';
import { ItemStock, ManualShoppingItem } from '../types';
import { ShoppingCart, Sparkles, AlertCircle, Copy, Check, Plus, MessageSquare, Trash2, Keyboard } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface ShoppingListProps {
  items: ItemStock[];
  manualItems: ManualShoppingItem[];
  onAddManual: (item: Omit<ManualShoppingItem, 'id'>) => void;
  onRemoveManual: (id: string) => void;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({ items, manualItems, onAddManual, onRemoveManual }) => {
  const itemsLowStock = items.filter(item => item.quantidade <= item.stockMinimo);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // State for manual overrides of order quantities
  const [orderQuantities, setOrderQuantities] = useState<{[id: string]: number}>({});
  // State for notes
  const [itemNotes, setItemNotes] = useState<{[id: string]: string}>({});
  const [openNoteId, setOpenNoteId] = useState<string | null>(null);

  // Manual Item Inputs
  const [manualName, setManualName] = useState('');
  const [manualQty, setManualQty] = useState(1);

  // Initialize quantities automatically when items change
  useEffect(() => {
    const newQuantities: {[id: string]: number} = {};
    itemsLowStock.forEach(item => {
      // Logic: Order enough to reach min stock + buffer of 5, or preserve existing edit
      if (orderQuantities[item.id] === undefined) {
         const deficit = item.stockMinimo - item.quantidade;
         newQuantities[item.id] = Math.max(1, deficit + 5); 
      } else {
         newQuantities[item.id] = orderQuantities[item.id];
      }
    });
    setOrderQuantities(newQuantities);
  }, [items, itemsLowStock.length]);

  const handleQuantityChange = (id: string, val: number) => {
    setOrderQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, val)
    }));
  };

  const handleNoteChange = (id: string, text: string) => {
    setItemNotes(prev => ({
      ...prev,
      [id]: text
    }));
  };

  const toggleNote = (id: string) => {
    setOpenNoteId(openNoteId === id ? null : id);
  };

  const handleAddManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;
    onAddManual({
      nome: manualName,
      quantidade: manualQty,
      nota: ''
    });
    setManualName('');
    setManualQty(1);
  };

  const getFinalList = () => {
    const autoItems = itemsLowStock.map(item => ({
      nome: item.nome,
      orderQty: orderQuantities[item.id] || 0,
      note: itemNotes[item.id] || '',
      isManual: false
    })).filter(i => i.orderQty > 0);

    const extraItems = manualItems.map(item => ({
      nome: item.nome,
      orderQty: item.quantidade,
      note: item.nota || '',
      isManual: true
    }));

    return [...autoItems, ...extraItems];
  };

  // Gemini Integration
  const handleAskAI = async () => {
    const finalList = getFinalList();
    if (finalList.length === 0) return;

    setLoading(true);
    setAiAdvice(null);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        setAiAdvice("Erro: Chave de API não configurada. Contacte o administrador.");
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
        Atua como um gestor de TI experiente. Preparei esta lista de compras de material informático:
        
        ${finalList.map(i => `- ${i.nome} (Qtd: ${i.orderQty}) ${i.note ? `[Nota: ${i.note}]` : ''} ${i.isManual ? '[Inserido Manualmente]' : '[Stock Baixo]'}`).join('\n')}
        
        Por favor:
        1. Analisa se as quantidades a encomendar parecem adequadas.
        2. Verifica se as notas adicionadas requerem atenção especial.
        3. Dá uma resposta concisa, profissional e formatada em HTML simples (usa <b>, <ul>, <li>).
        Escreve em Português de Portugal.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setAiAdvice(response.text);

    } catch (error) {
      console.error("Erro AI:", error);
      setAiAdvice("Não foi possível contactar o assistente IA neste momento.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const finalList = getFinalList();
    const text = finalList.map(i => {
      const noteStr = i.note ? ` -- Obs: ${i.note}` : '';
      return `[ ] ${i.nome}: ${i.orderQty} unid.${noteStr}`;
    }).join('\n');
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Lista de Compras</h2>
          <p className="text-slate-500 text-sm">Automática (Stock Baixo) + Manual</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={handleCopy}
            disabled={itemsLowStock.length === 0 && manualItems.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
            <span>Copiar Lista</span>
          </button>
          <button 
            onClick={handleAskAI}
            disabled={loading || (itemsLowStock.length === 0 && manualItems.length === 0)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <Sparkles size={18} />
            <span>{loading ? 'A Analisar...' : 'Analisar com IA'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section 1: Low Stock (Automated) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <AlertCircle size={18} className="text-orange-500" />
                Reposição de Stock (Automático)
              </h3>
              <span className="text-xs bg-slate-200 px-2 py-1 rounded-full text-slate-600">{itemsLowStock.length} itens</span>
            </div>
            
            {itemsLowStock.length > 0 ? (
              <div className="divide-y divide-slate-100">
                <div className="bg-slate-50 px-4 py-2 grid grid-cols-12 gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <div className="col-span-6">Item</div>
                  <div className="col-span-3 text-right">Défice</div>
                  <div className="col-span-3 text-right">Qtd. Encomenda</div>
                </div>
                {itemsLowStock.map(item => {
                  const deficit = item.stockMinimo - item.quantidade;
                  const orderQty = orderQuantities[item.id] || 0;
                  const note = itemNotes[item.id] || '';
                  const isNoteOpen = openNoteId === item.id;
                  
                  return (
                    <div key={item.id} className="hover:bg-slate-50 transition-colors group">
                      <div className="p-4 grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-6 flex items-center gap-3">
                           {/* Icon placeholder or category color */}
                           <div className="w-2 h-8 bg-orange-200 rounded-full"></div>
                           <div>
                            <h4 className="font-medium text-slate-800 text-sm">{item.nome}</h4>
                            <p className="text-xs text-slate-500">{item.categoria}</p>
                           </div>
                        </div>
                        
                        <div className="col-span-3 text-right">
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                            -{deficit}
                          </span>
                        </div>
                        
                        <div className="col-span-3 flex justify-end gap-2 items-center">
                           <input 
                              type="number"
                              min="0"
                              value={orderQty}
                              onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                              className="w-16 text-center px-1 py-1 border border-slate-300 rounded text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          <button
                            onClick={() => toggleNote(item.id)}
                            className={`p-1.5 rounded-md transition-all ${note || isNoteOpen ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}
                          >
                            <MessageSquare size={16} />
                          </button>
                        </div>
                      </div>
                      
                      {(isNoteOpen || note) && (
                        <div className="px-4 pb-4 pl-12">
                          <input 
                             type="text"
                             value={note}
                             onChange={(e) => handleNoteChange(item.id, e.target.value)}
                             placeholder="Adicionar nota..."
                             className="w-full text-xs px-3 py-2 border border-blue-200 bg-blue-50/30 rounded-lg focus:outline-none text-slate-600"
                           />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
               <div className="p-8 text-center text-slate-400 text-sm">
                 Nenhum item com stock baixo.
               </div>
            )}
          </div>

          {/* Section 2: Manual Items */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <Keyboard size={18} className="text-blue-500" />
                Itens Adicionais (Manual)
              </h3>
            </div>

            {/* Manual Entry Form */}
            <form onSubmit={handleAddManualItem} className="p-4 bg-slate-50 border-b border-slate-100 flex gap-2">
               <input 
                 type="text"
                 value={manualName}
                 onChange={(e) => setManualName(e.target.value)}
                 placeholder="Ex: Cadeira nova, Café, Cabo especial..."
                 className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
               />
               <input 
                 type="number"
                 min="1"
                 value={manualQty}
                 onChange={(e) => setManualQty(parseInt(e.target.value))}
                 className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
               />
               <button 
                 type="submit"
                 disabled={!manualName.trim()}
                 className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <Plus size={20} />
               </button>
            </form>

            {manualItems.length > 0 ? (
               <div className="divide-y divide-slate-100">
                 {manualItems.map(item => (
                   <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 group">
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                         <span className="font-medium text-slate-800 text-sm">{item.nome}</span>
                      </div>
                      <div className="flex items-center gap-4">
                         <span className="font-bold text-slate-700 text-sm">{item.quantidade} un.</span>
                         <button 
                           onClick={() => onRemoveManual(item.id)}
                           className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                         >
                           <Trash2 size={16} />
                         </button>
                      </div>
                   </div>
                 ))}
               </div>
            ) : (
              <div className="p-6 text-center text-slate-400 text-sm italic">
                A lista manual está vazia. Adicione itens acima.
              </div>
            )}
          </div>

        </div>

        {/* AI Sidebar */}
        <div className="space-y-6">
          <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 sticky top-6">
            <h3 className="font-bold text-purple-900 flex items-center gap-2 mb-4">
              <Sparkles size={18} />
              Consultor IA
            </h3>
            {!aiAdvice ? (
               <div className="text-center py-6">
                  <p className="text-sm text-purple-700 mb-4">
                    Estou pronto para analisar a tua lista completa (automática + manual). 
                  </p>
                  <p className="text-xs text-purple-600">
                    Clica em "Analisar com IA" para receber sugestões.
                  </p>
               </div>
            ) : (
              <div className="prose prose-sm prose-purple text-slate-700 text-sm">
                 <div dangerouslySetInnerHTML={{ __html: aiAdvice }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};