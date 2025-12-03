import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Sidebar } from './components/Sidebar';
import { DADOS_INICIAIS } from './constants';
import { ItemStock, Movimento, TipoMovimento, ViewState, ManualShoppingItem } from './types';
import { Loader2 } from 'lucide-react';

// Lazy load components to fix chunk size warnings and improve initial load
const Dashboard = lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const Inventory = lazy(() => import('./components/Inventory').then(module => ({ default: module.Inventory })));
const StockMovement = lazy(() => import('./components/StockMovement').then(module => ({ default: module.StockMovement })));
const History = lazy(() => import('./components/History').then(module => ({ default: module.History })));
const ShoppingList = lazy(() => import('./components/ShoppingList').then(module => ({ default: module.ShoppingList })));

// Simple ID generator since we can't easily import uuid in this specific env without package.json
const generateId = () => Math.random().toString(36).substr(2, 9);

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('DASHBOARD');
  
  // State
  const [items, setItems] = useState<ItemStock[]>([]);
  const [logs, setLogs] = useState<Movimento[]>([]);
  const [manualShoppingList, setManualShoppingList] = useState<ManualShoppingItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const savedItems = localStorage.getItem('it-stock-items');
    const savedLogs = localStorage.getItem('it-stock-logs');
    const savedManual = localStorage.getItem('it-stock-manual-list');

    if (savedItems) {
      setItems(JSON.parse(savedItems));
    } else {
      setItems(DADOS_INICIAIS);
    }

    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }

    if (savedManual) {
      setManualShoppingList(JSON.parse(savedManual));
    }

    setIsLoaded(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('it-stock-items', JSON.stringify(items));
      localStorage.setItem('it-stock-logs', JSON.stringify(logs));
      localStorage.setItem('it-stock-manual-list', JSON.stringify(manualShoppingList));
    }
  }, [items, logs, manualShoppingList, isLoaded]);

  // Actions
  const handleAddItem = (newItemData: Omit<ItemStock, 'id' | 'ultimaAtualizacao'>, motivoInicial?: string) => {
    const newItem: ItemStock = {
      ...newItemData,
      id: generateId(),
      ultimaAtualizacao: new Date().toISOString()
    };
    setItems(prevItems => [...prevItems, newItem]);
    
    // Log initial creation as ENTRADA
    if (newItem.quantidade > 0) {
      addLog(newItem.id, newItem.nome, TipoMovimento.ENTRADA, newItem.quantidade, motivoInicial || 'Stock Inicial');
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<ItemStock>) => {
    // Esta função atualiza o stock SEM gerar um movimento no histórico.
    // Ideal para correções de contagem.
    setItems(items.map(item => item.id === id ? { ...item, ...updates, ultimaAtualizacao: new Date().toISOString() } : item));
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleStockMovement = (itemId: string, type: TipoMovimento, quantity: number, reason: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const newQuantity = type === TipoMovimento.ENTRADA 
      ? item.quantidade + quantity 
      : item.quantidade - quantity;

    if (newQuantity < 0) {
      alert("Erro: Stock insuficiente para esta saída.");
      return;
    }

    setItems(items.map(i => i.id === itemId ? { ...i, quantidade: newQuantity, ultimaAtualizacao: new Date().toISOString() } : i));
    
    // Log with correct sign
    const signedQty = type === TipoMovimento.SAIDA ? -quantity : quantity;
    addLog(itemId, item.nome, type, signedQty, reason);
  };

  const addLog = (itemId: string, itemNome: string, tipo: TipoMovimento, qtd: number, motivo: string) => {
    const newLog: Movimento = {
      id: generateId(),
      itemId,
      itemNome,
      tipo,
      quantidade: qtd,
      data: new Date().toISOString(),
      motivo
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Manual Shopping List Actions
  const handleAddManualShoppingItem = (item: Omit<ManualShoppingItem, 'id'>) => {
    setManualShoppingList(prev => [...prev, { ...item, id: generateId() }]);
  };

  const handleRemoveManualShoppingItem = (id: string) => {
    setManualShoppingList(prev => prev.filter(i => i.id !== id));
  };

  const renderContent = () => {
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard items={items} />;
      case 'INVENTARIO':
        return <Inventory 
          items={items} 
          logs={logs}
          onAddItem={handleAddItem} 
          onUpdateItem={handleUpdateItem} 
          onDeleteItem={handleDeleteItem}
        />;
      case 'MOVIMENTOS':
        return <StockMovement 
          items={items} 
          onMovement={handleStockMovement} 
          onAddItem={handleAddItem}
        />;
      case 'HISTORICO':
        return <History logs={logs} />;
      case 'COMPRAS':
        return <ShoppingList 
          items={items} 
          manualItems={manualShoppingList}
          onAddManual={handleAddManualShoppingItem}
          onRemoveManual={handleRemoveManualShoppingItem}
        />;
      default:
        return <Dashboard items={items} />;
    }
  };

  // Loading spinner for Suspense fallback
  const LoadingState = () => (
    <div className="flex h-full min-h-[50vh] flex-col items-center justify-center text-slate-400 gap-3">
      <Loader2 size={40} className="animate-spin text-blue-500" />
      <span className="text-sm font-medium animate-pulse">A carregar módulo...</span>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-900">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      <main className="ml-64 flex-1 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
          <Suspense fallback={<LoadingState />}>
            {renderContent()}
          </Suspense>
        </div>
      </main>
    </div>
  );
}