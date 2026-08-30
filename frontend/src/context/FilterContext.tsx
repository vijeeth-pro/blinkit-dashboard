import React, { createContext, useContext, useState } from 'react';
import { GlobalFiltersState } from '../types/api';

const defaultFilters: GlobalFiltersState = {
  startDate: '',
  endDate: '',
  category: 'All',
  customerSegment: 'All',
  paymentMethod: 'All',
  deliveryStatus: 'All',
  storeId: '',
  search: '',
};

interface FilterContextType {
  filters: GlobalFiltersState;
  setFilters: React.Dispatch<React.SetStateAction<GlobalFiltersState>>;
  updateFilter: (key: keyof GlobalFiltersState, value: string) => void;
  resetFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<GlobalFiltersState>(defaultFilters);

  const updateFilter = (key: keyof GlobalFiltersState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <FilterContext.Provider value={{ filters, setFilters, updateFilter, resetFilters }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used within FilterProvider');
  return ctx;
};
