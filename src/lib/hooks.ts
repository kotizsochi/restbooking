import { useState, useEffect } from "react";

/**
 * Debounce hook - задерживает обновление значения на delay ms.
 * Используется для поиска, чтобы не фильтровать на каждый символ.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
