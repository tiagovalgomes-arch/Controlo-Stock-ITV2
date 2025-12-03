export enum Categoria {
  HARDWARE = 'Hardware',
  COMPONENTES = 'Componentes',
  REDES = 'Redes',
  ARMAZENAMENTO = 'Armazenamento',
  PERIFERICOS = 'Periféricos',
  SOFTWARE = 'Software / Licenças',
  ACESSORIOS = 'Acessórios',
  CONSUMIVEIS = 'Consumíveis',
  SEGURANCA = 'Segurança / CCTV',
  FERRAMENTAS = 'Ferramentas'
}

export interface ItemStock {
  id: string;
  nome: string;
  categoria: Categoria | string;
  quantidade: number;
  stockMinimo: number;
  localizacao?: string; // Ex: Armário A, Gaveta 2
  referencia?: string; // Ex: Serial Number, Modelo, Observação
  ultimaAtualizacao: string;
}

export interface ManualShoppingItem {
  id: string;
  nome: string;
  quantidade: number;
  nota?: string;
}

export enum TipoMovimento {
  ENTRADA = 'ENTRADA',
  SAIDA = 'SAIDA',
  CORRECAO = 'CORRECAO' // Para ajustes rápidos que não são compras formais
}

export interface Movimento {
  id: string;
  itemId: string;
  itemNome: string;
  tipo: TipoMovimento;
  quantidade: number; // Positivo para entrada, negativo para saída
  data: string;
  motivo?: string; // Ex: "Projeto X", "Avaria", "Compra Fatura 123"
  usuario?: string; // Quem requisitou/registou
}

export type ViewState = 'DASHBOARD' | 'INVENTARIO' | 'MOVIMENTOS' | 'COMPRAS' | 'HISTORICO';