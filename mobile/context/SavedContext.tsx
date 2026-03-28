import React, { createContext, useContext, useState, useCallback } from "react";

interface SavedContextType {
  savedIds: Set<string>;
  isSaved: (id: string) => boolean;
  toggleSaved: (id: string) => void;
  savedCount: number;
}

const SavedContext = createContext<SavedContextType>({
  savedIds: new Set(),
  isSaved: () => false,
  toggleSaved: () => {},
  savedCount: 0,
});

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const isSaved = useCallback((id: string) => savedIds.has(id), [savedIds]);

  const toggleSaved = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <SavedContext.Provider value={{ savedIds, isSaved, toggleSaved, savedCount: savedIds.size }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  return useContext(SavedContext);
}
