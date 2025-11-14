import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook для API запросов с кэшированием
 * @param {Function} apiFunction - Функция API запроса
 * @param {Array} dependencies - Зависимости для повторного запроса
 * @param {Object} options - Настройки кэширования
 */
export const useCachedApi = (apiFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    cache = true,
    cacheTime = 5 * 60 * 1000, // 5 минут
    enabled = true
  } = options;

  const cacheRef = useRef({});
  const cacheKey = JSON.stringify(dependencies);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      // Проверяем кэш
      if (cache && cacheRef.current[cacheKey]) {
        const cached = cacheRef.current[cacheKey];
        const now = Date.now();

        if (now - cached.timestamp < cacheTime) {
          setData(cached.data);
          setLoading(false);
          return cached.data;
        }
      }

      // Выполняем запрос
      const result = await apiFunction();

      // Сохраняем в кэш
      if (cache) {
        cacheRef.current[cacheKey] = {
          data: result,
          timestamp: Date.now()
        };
      }

      setData(result);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message || 'Произошла ошибка');
      setLoading(false);
    }
  }, [apiFunction, cacheKey, cache, cacheTime, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    delete cacheRef.current[cacheKey];
    return fetchData();
  }, [cacheKey, fetchData]);

  return { data, loading, error, refetch };
};

export default useCachedApi;
