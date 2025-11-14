import React, { memo } from 'react';

/**
 * HOC для оптимизации компонентов с мемоизацией
 */
export const withMemo = (Component, propsAreEqual) => {
  return memo(Component, propsAreEqual);
};

/**
 * Утилита для глубокого сравнения пропсов
 */
export const deepCompareProps = (prevProps, nextProps) => {
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
};

/**
 * Утилита для отложенного выполнения (debounce)
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Утилита для ограничения частоты вызовов (throttle)
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Lazy loading компонента с обработкой ошибок
 */
export const lazyWithRetry = (componentImport) => {
  return React.lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        return window.location.reload();
      }
      throw error;
    }
  });
};

/**
 * Проверка необходимости обновления компонента
 */
export const shouldComponentUpdate = (prevProps, nextProps, keys) => {
  for (const key of keys) {
    if (prevProps[key] !== nextProps[key]) {
      return false; // Props changed, component should update
    }
  }
  return true; // Props are equal, no need to update
};

/**
 * Мемоизация функции с кэшированием результатов
 */
export const memoize = (fn) => {
  const cache = new Map();

  return (...args) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);

    // Ограничиваем размер кэша
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    return result;
  };
};

/**
 * Виртуализация больших списков - helper для расчета видимых элементов
 */
export const getVisibleItems = (items, scrollTop, containerHeight, itemHeight) => {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);

  return {
    visibleItems: items.slice(startIndex, endIndex + 1),
    startIndex,
    endIndex,
    offsetY: startIndex * itemHeight
  };
};

/**
 * IntersectionObserver hook helper
 */
export const createIntersectionObserver = (callback, options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver(callback, defaultOptions);
};

export default {
  withMemo,
  deepCompareProps,
  debounce,
  throttle,
  lazyWithRetry,
  shouldComponentUpdate,
  memoize,
  getVisibleItems,
  createIntersectionObserver
};
