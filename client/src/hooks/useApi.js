import { useAuth } from '../contexts/AuthContext';

export const useApi = () => {
  const { getAuthHeaders } = useAuth();

  const apiCall = async (url, options = {}) => {
    const headers = {
      ...getAuthHeaders(),
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Ошибка сервера' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  };

  return {
    apiCall,
    get: (url, options = {}) => apiCall(url, { ...options, method: 'GET' }),
    post: (url, data, options = {}) => apiCall(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    }),
    put: (url, data, options = {}) => apiCall(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (url, options = {}) => apiCall(url, { ...options, method: 'DELETE' })
  };
};

export default useApi;
