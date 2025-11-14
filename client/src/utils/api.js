import { API_ENDPOINTS } from './constants';
import { getToken, clearAuth } from './helpers';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Базовый HTTP клиент
 */
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  /**
   * Получить заголовки запроса
   */
  getHeaders(isFormData = false) {
    const headers = {};

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Обработка ответа
   */
  async handleResponse(response) {
    // Если токен невалидный, очищаем auth
    if (response.status === 401 || response.status === 403) {
      clearAuth();
      window.location.href = '/login';
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Ошибка API');
    }

    return data;
  }

  /**
   * GET запрос
   */
  async get(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }

  /**
   * POST запрос
   */
  async post(endpoint, body) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });

    return this.handleResponse(response);
  }

  /**
   * PUT запрос
   */
  async put(endpoint, body) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });

    return this.handleResponse(response);
  }

  /**
   * PATCH запрос
   */
  async patch(endpoint, body) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });

    return this.handleResponse(response);
  }

  /**
   * DELETE запрос
   */
  async delete(endpoint) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    return this.handleResponse(response);
  }
}

// Создаем экземпляр клиента
const apiClient = new ApiClient(API_BASE_URL);

/**
 * API методы для аутентификации
 */
export const authApi = {
  login: (email, password) => apiClient.post(API_ENDPOINTS.LOGIN, { email, password }),
  register: (userData) => apiClient.post(API_ENDPOINTS.REGISTER, userData),
  verify: () => apiClient.post(API_ENDPOINTS.VERIFY)
};

/**
 * API методы для пользователей
 */
export const usersApi = {
  getAll: () => apiClient.get(API_ENDPOINTS.USERS),
  getOne: (id) => apiClient.get(API_ENDPOINTS.USER(id)),
  create: (userData) => apiClient.post(API_ENDPOINTS.USERS, userData),
  update: (id, userData) => apiClient.put(API_ENDPOINTS.USER(id), userData),
  delete: (id) => apiClient.delete(API_ENDPOINTS.USER(id))
};

/**
 * API методы для проектов
 */
export const projectsApi = {
  getAll: () => apiClient.get(API_ENDPOINTS.PROJECTS),
  getOne: (id) => apiClient.get(API_ENDPOINTS.PROJECT(id)),
  create: (projectData) => apiClient.post(API_ENDPOINTS.PROJECTS, projectData),
  update: (id, projectData) => apiClient.put(API_ENDPOINTS.PROJECT(id), projectData),
  delete: (id) => apiClient.delete(API_ENDPOINTS.PROJECT(id))
};

/**
 * API методы для задач
 */
export const tasksApi = {
  getAll: (projectId) => apiClient.get(API_ENDPOINTS.TASKS, projectId ? { projectId } : {}),
  getOne: (id) => apiClient.get(API_ENDPOINTS.TASK(id)),
  create: (taskData) => apiClient.post(API_ENDPOINTS.TASKS, taskData),
  update: (id, taskData) => apiClient.put(API_ENDPOINTS.TASK(id), taskData),
  updateStatus: (id, status) => apiClient.patch(API_ENDPOINTS.TASK_STATUS(id), { status }),
  delete: (id) => apiClient.delete(API_ENDPOINTS.TASK(id))
};

/**
 * API методы для комментариев
 */
export const commentsApi = {
  getByTask: (taskId) => apiClient.get(API_ENDPOINTS.TASK_COMMENTS(taskId)),
  create: (taskId, content, authorId) =>
    apiClient.post(API_ENDPOINTS.TASK_COMMENTS(taskId), { content, authorId }),
  update: (id, content) => apiClient.put(API_ENDPOINTS.COMMENT(id), { content }),
  delete: (id) => apiClient.delete(API_ENDPOINTS.COMMENT(id))
};

/**
 * API методы для шаблонов
 */
export const templatesApi = {
  getAll: (category) => apiClient.get(API_ENDPOINTS.TEMPLATES, category ? { category } : {}),
  getOne: (id) => apiClient.get(API_ENDPOINTS.TEMPLATE(id)),
  create: (templateData) => apiClient.post(API_ENDPOINTS.TEMPLATES, templateData),
  update: (id, templateData) => apiClient.put(API_ENDPOINTS.TEMPLATE(id), templateData),
  delete: (id) => apiClient.delete(API_ENDPOINTS.TEMPLATE(id))
};

/**
 * API методы для статистики и поиска
 */
export const statsApi = {
  getStats: () => apiClient.get(API_ENDPOINTS.STATS),
  getOverdueTasks: () => apiClient.get(API_ENDPOINTS.OVERDUE_TASKS),
  getTodayTasks: () => apiClient.get(API_ENDPOINTS.TODAY_TASKS),
  search: (query, type) => apiClient.get(API_ENDPOINTS.SEARCH, { q: query, type })
};

/**
 * API методы для экспорта
 */
export const exportApi = {
  exportProjects: () => apiClient.get(API_ENDPOINTS.EXPORT_PROJECTS),
  exportTasks: () => apiClient.get(API_ENDPOINTS.EXPORT_TASKS),
  exportAll: () => apiClient.get(API_ENDPOINTS.EXPORT_ALL)
};

// Экспортируем клиент для кастомных запросов
export default apiClient;
