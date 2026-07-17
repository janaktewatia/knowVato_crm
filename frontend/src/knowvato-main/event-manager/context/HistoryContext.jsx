// src/context/HistoryContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const HistoryContext = createContext();

export const useHistory = () => useContext(HistoryContext);

export const HistoryProvider = ({ children }) => {
  const [history, setHistory] = useLocalStorage("qr_history", []);
  const [favorites, setFavorites] = useLocalStorage("qr_favorites", []);
  const [templates, setTemplates] = useLocalStorage("qr_templates", []);

  const addToHistory = (qrItem) => {
    const newItem = {
      id: Date.now(),
      ...qrItem,
      createdAt: new Date().toISOString(),
    };
    setHistory((prev) => [newItem, ...prev].slice(0, 50)); // Keep last 50
  };

  const removeFromHistory = (id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const addToFavorites = (qrItem) => {
    if (!favorites.find((fav) => fav.id === qrItem.id)) {
      setFavorites((prev) => [...prev, qrItem]);
    }
  };

  const removeFromFavorites = (id) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };

  const saveAsTemplate = (template) => {
    const newTemplate = {
      id: Date.now(),
      ...template,
      createdAt: new Date().toISOString(),
    };
    setTemplates((prev) => [...prev, newTemplate]);
  };

  const duplicateQR = (qrItem) => {
    const duplicated = {
      ...qrItem,
      id: Date.now(),
      name: `${qrItem.name} (Copy)`,
      createdAt: new Date().toISOString(),
    };
    setHistory((prev) => [duplicated, ...prev]);
    return duplicated;
  };

  return (
    <HistoryContext.Provider
      value={{
        history,
        favorites,
        templates,
        addToHistory,
        removeFromHistory,
        clearHistory,
        addToFavorites,
        removeFromFavorites,
        saveAsTemplate,
        duplicateQR,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
};
