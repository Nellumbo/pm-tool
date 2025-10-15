// Mock API для статического развертывания
// Это позволит демонстрировать приложение без backend

class MockAPI {
  constructor() {
    this.users = [
      { id: '1', name: 'Администратор', email: 'admin@example.com', role: 'admin' },
      { id: '2', name: 'Менеджер проектов', email: 'manager@example.com', role: 'manager' },
      { id: '3', name: 'Разработчик', email: 'developer@example.com', role: 'developer' },
      { id: '4', name: 'Тестировщик', email: 'tester@example.com', role: 'developer' }
    ];
    
    this.projects = [
      {
        id: '1',
        name: 'Разработка мобильного приложения',
        description: 'Создание кроссплатформенного мобильного приложения',
        startDate: '2024-01-15',
        endDate: '2024-06-30',
        status: 'active',
        managerId: '2',
        progress: 65
      },
      {
        id: '2',
        name: 'Веб-платформа для клиентов',
        description: 'Разработка веб-интерфейса для управления заказами',
        startDate: '2024-02-01',
        endDate: '2024-05-15',
        status: 'completed',
        managerId: '2',
        progress: 100
      },
      {
        id: '3',
        name: 'Система аналитики',
        description: 'Внедрение системы сбора и анализа данных',
        startDate: '2024-03-01',
        endDate: '2024-08-31',
        status: 'paused',
        managerId: '1',
        progress: 30
      }
    ];
    
    this.tasks = [
      {
        id: '1',
        title: 'Дизайн пользовательского интерфейса',
        description: 'Создание макетов основных экранов приложения',
        priority: 'high',
        status: 'in-progress',
        projectId: '1',
        assigneeId: '3',
        dueDate: '2024-04-15',
        createdAt: '2024-01-20'
      },
      {
        id: '2',
        title: 'Настройка базы данных',
        description: 'Создание схемы базы данных и миграций',
        priority: 'medium',
        status: 'completed',
        projectId: '1',
        assigneeId: '4',
        dueDate: '2024-03-01',
        createdAt: '2024-01-15'
      },
      {
        id: '3',
        title: 'Тестирование API',
        description: 'Проведение unit и integration тестов',
        priority: 'high',
        status: 'todo',
        projectId: '2',
        assigneeId: '4',
        dueDate: '2024-05-10',
        createdAt: '2024-02-05'
      },
      {
        id: '4',
        title: 'Документация API',
        description: 'Создание документации для разработчиков',
        priority: 'low',
        status: 'todo',
        projectId: '2',
        assigneeId: '3',
        dueDate: '2024-05-20',
        createdAt: '2024-02-10'
      }
    ];
    
    this.comments = [
      {
        id: '1',
        taskId: '1',
        userId: '3',
        text: 'Начал работу над дизайном главного экрана',
        createdAt: '2024-01-25T10:30:00Z'
      },
      {
        id: '2',
        taskId: '1',
        userId: '2',
        text: 'Отличная работа! Учти замечания по UX',
        createdAt: '2024-01-26T14:15:00Z'
      }
    ];
  }

  // Mock аутентификация
  async login(email, password) {
    const user = this.users.find(u => u.email === email);
    if (user && password) {
      return {
        token: 'mock-jwt-token',
        user: { ...user, password: undefined }
      };
    }
    throw new Error('Неверный email или пароль');
  }

  // Mock API методы
  async get(url) {
    const endpoint = url.replace('/api/', '');
    
    switch (endpoint) {
      case 'users':
        return this.users;
      case 'projects':
        return this.projects;
      case 'tasks':
        return this.tasks;
      default:
        if (endpoint.startsWith('tasks/') && endpoint.includes('/comments')) {
          const taskId = endpoint.split('/')[1];
          return this.comments.filter(c => c.taskId === taskId);
        }
        return [];
    }
  }

  async post(url, data) {
    // Mock создание новых элементов
    console.log('POST', url, data);
    return { success: true, id: Date.now().toString() };
  }

  async put(url, data) {
    // Mock обновление элементов
    console.log('PUT', url, data);
    return { success: true };
  }

  async patch(url, data) {
    // Mock частичное обновление
    console.log('PATCH', url, data);
    return { success: true };
  }

  async delete(url) {
    // Mock удаление элементов
    console.log('DELETE', url);
    return { success: true };
  }
}

// Экспортируем для использования в браузере
window.MockAPI = MockAPI;
