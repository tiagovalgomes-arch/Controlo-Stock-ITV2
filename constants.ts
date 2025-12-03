import { Categoria, ItemStock } from './types';

// Começar com lista vazia conforme solicitado
export const DADOS_INICIAIS: ItemStock[] = [];

// Lista base, mas agora será gerida dinamicamente no App.tsx
export const CATEGORIAS_DEFAULT = Object.values(Categoria);