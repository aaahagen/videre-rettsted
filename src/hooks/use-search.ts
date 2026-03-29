import { create } from 'zustand';

interface SearchStore {
  query: string;
  setQuery: (query: string) => void;
  contextName: string;
  contextLink: string;
  setContext: (name: string, link: string) => void;
}

export const useSearch = create<SearchStore>((set) => ({
  query: '',
  setQuery: (query) => set({ query }),
  contextName: 'Steder',
  contextLink: '/dashboard/new',
  setContext: (name, link) => set({ contextName: name, contextLink: link }),
}));