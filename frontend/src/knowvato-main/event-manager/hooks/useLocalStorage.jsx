import { useState, useEffect } from "react";

export const useLocalStorage = (key, initialValue) => {
  const readValue = () => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`useLocalStorage: Error reading key \"${key}\"`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState(readValue);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`useLocalStorage: Error storing key \"${key}\"`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};
