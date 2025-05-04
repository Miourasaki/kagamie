import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export type StateType<T> = [T, Dispatch<SetStateAction<T>>]

export interface ReactiveState<S> {
  value: S,
  set: Dispatch<SetStateAction<S>>
}

export function useReactiveState<T>(initialValue: T): ReactiveState<T> {
  const [state, setState] = useState(initialValue);

  return {
    value: state,
    set: setState
  };
}

export function useReactiveLSState<T>(key: string,initialValue: T): ReactiveState<T> {
  const [state, setState] = useLSState(key,initialValue);

  return {
    value: state,
    set: setState
  };
}

/**
 * 自动同步到 localStorage 的 useState Hook
 * @param key 本地存储的键名
 * @param initialValue 初始值
 * @returns 类似 useState 的返回，包含状态值和更新函数
 */
export function useLSState<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // 只有在客户端才读取 localStorage
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // 只在客户端设置初始值
  useEffect(() => {
    setStoredValue(readValue());
  }, []);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== event.oldValue) {
        try {
          const newValue = event.newValue ? JSON.parse(event.newValue) : initialValue;
          setStoredValue(newValue);
        } catch (error) {
          console.warn(`Error parsing localStorage key "${key}":`, error);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [key, initialValue]);

  return [storedValue, setValue];
}
