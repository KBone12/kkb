/**
 * AppContext - Global state management using React Context
 * Integrates DataStore with React components
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DataStore } from './DataStore';
import type { AppData } from '../types';

const STORAGE_KEY = 'kkb-data';

interface AppContextValue {
  dataStore: DataStore;
  data: AppData;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

interface AppProviderProps {
  children: React.ReactNode;
}

/**
 * Load data from localStorage
 */
function loadFromStorage(): AppData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }
    return JSON.parse(stored) as AppData;
  } catch (error) {
    console.error('Failed to load data from localStorage:', error);
    return null;
  }
}

/**
 * Save data to localStorage
 */
function saveToStorage(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save data to localStorage:', error);
  }
}

export function AppProvider({ children }: AppProviderProps): React.JSX.Element {
  const [dataStore] = useState(() => {
    const stored = loadFromStorage();
    return new DataStore(stored || undefined);
  });

  const [data, setData] = useState<AppData>(() => dataStore.getData());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refresh data from DataStore
  const refresh = useCallback(() => {
    try {
      const currentData = dataStore.getData();
      setData(currentData);
      saveToStorage(currentData);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Error refreshing data:', err);
    }
  }, [dataStore]);

  // Initial load
  useEffect(() => {
    setLoading(true);
    try {
      refresh();
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: AppContextValue = {
    dataStore,
    data,
    loading,
    error,
    refresh,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Hook to access AppContext
 * @throws Error if used outside AppProvider
 */
export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
