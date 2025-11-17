const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

/**
 * Глобальный поиск
 */
const search = (req, res, projects, tasks) => {
  const { q: query, type } = req.query;

  if (!query || query.trim().length < 2) {
    return res.json({ projects: [], tasks: [] });
  }

  const searchTerm = query.toLowerCase().trim();

  // Поиск проектов
  const matchingProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm) ||
    project.description.toLowerCase().includes(searchTerm)
  );

  // Поиск задач
  const matchingTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm) ||
    task.description.toLowerCase().includes(searchTerm)
  );

  // Если указан тип, фильтруем результат
  if (type === 'projects') {
    res.json({ projects: matchingProjects, tasks: [] });
  } else if (type === 'tasks') {
    res.json({ projects: [], tasks: matchingTasks });
  } else {
    res.json({ projects: matchingProjects, tasks: matchingTasks });
  }
};

/**
 * Получить просроченные задачи
 */
const getOverdueTasks = (req, res, tasks) => {
  const now = new Date();
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === 'completed') return false;
    return new Date(task.dueDate) < now;
  });

  res.json(overdueTasks);
};

/**
 * Получить задачи на сегодня
 */
const getTodayTasks = (req, res, tasks) => {
  const today = moment().format('YYYY-MM-DD');
  const todayTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === 'completed') return false;
    return task.dueDate.startsWith(today);
  });

  res.json(todayTasks);
};

/**
 * Общая статистика
 */
const getStats = (req, res, projects, tasks, users) => {
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    totalTasks: tasks.length,
    todoTasks: tasks.filter(t => t.status === 'todo').length,
    inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    highPriorityTasks: tasks.filter(t => t.priority === 'high').length,
    totalUsers: users.length
  };

  res.json(stats);
};

/**
 * Экспорт проектов в CSV
 */
const exportProjects = (req, res, projects, users) => {
  const csvHeader = 'ID,Название,Описание,Статус,Дата начала,Дата окончания,Менеджер,Создан,Обновлен\n';
  const csvData = projects.map(project => {
    const manager = users.find(u => u.id === project.managerId);
    return [
      project.id,
      `"${project.name}"`,
      `"${project.description || ''}"`,
      project.status,
      project.startDate ? moment(project.startDate).format('DD.MM.YYYY') : '',
      project.endDate ? moment(project.endDate).format('DD.MM.YYYY') : '',
      manager ? `"${manager.name}"` : '',
      moment(project.createdAt).format('DD.MM.YYYY HH:mm'),
      moment(project.updatedAt).format('DD.MM.YYYY HH:mm')
    ].join(',');
  }).join('\n');

  const csv = csvHeader + csvData;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=projects_${moment().format('YYYY-MM-DD')}.csv`);
  res.send('\ufeff' + csv); // BOM для правильного отображения кириллицы в Excel
};

/**
 * Экспорт задач в CSV
 */
const exportTasks = (req, res, projects, tasks, users) => {
  const csvHeader = 'ID,Название,Описание,Приоритет,Статус,Проект,Исполнитель,Срок,Создан,Обновлен\n';
  const csvData = tasks.map(task => {
    const project = projects.find(p => p.id === task.projectId);
    const assignee = users.find(u => u.id === task.assigneeId);
    return [
      task.id,
      `"${task.title}"`,
      `"${task.description || ''}"`,
      task.priority,
      task.status,
      project ? `"${project.name}"` : '',
      assignee ? `"${assignee.name}"` : '',
      task.dueDate ? moment(task.dueDate).format('DD.MM.YYYY') : '',
      moment(task.createdAt).format('DD.MM.YYYY HH:mm'),
      moment(task.updatedAt).format('DD.MM.YYYY HH:mm')
    ].join(',');
  }).join('\n');

  const csv = csvHeader + csvData;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=tasks_${moment().format('YYYY-MM-DD')}.csv`);
  res.send('\ufeff' + csv);
};

/**
 * Экспорт всех данных в CSV
 */
const exportAll = (req, res, projects, tasks, users) => {
  const data = {
    projects,
    tasks,
    users: users.map(u => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    }),
    exportDate: moment().format('YYYY-MM-DD HH:mm:ss')
  };

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=all_data_${moment().format('YYYY-MM-DD')}.json`);
  res.json(data);
};

/**
 * Получить шаблоны задач
 */
const getTemplates = (req, res, templates) => {
  const { category } = req.query;

  if (category) {
    const filteredTemplates = templates.filter(t => t.category === category);
    res.json(filteredTemplates);
  } else {
    res.json(templates);
  }
};

/**
 * Создать шаблон задачи
 */
const createTemplate = (req, res, templates) => {
  const { name, description, priority = 'medium', category } = req.body;
  const newTemplate = {
    id: uuidv4(),
    name,
    description,
    priority,
    category
  };
  templates.push(newTemplate);
  res.json(newTemplate);
};

/**
 * Обновить шаблон
 */
const updateTemplate = (req, res, templates) => {
  const templateIndex = templates.findIndex(t => t.id === req.params.id);
  if (templateIndex === -1) {
    return res.status(404).json({ message: 'Шаблон не найден' });
  }

  const updatedTemplate = {
    ...templates[templateIndex],
    ...req.body
  };
  templates[templateIndex] = updatedTemplate;
  res.json(updatedTemplate);
};

/**
 * Удалить шаблон
 */
const deleteTemplate = (req, res, templates) => {
  const templateIndex = templates.findIndex(t => t.id === req.params.id);
  if (templateIndex === -1) {
    return res.status(404).json({ message: 'Шаблон не найден' });
  }

  templates.splice(templateIndex, 1);
  res.json({ message: 'Шаблон удален' });
};

module.exports = {
  search,
  getOverdueTasks,
  getTodayTasks,
  getStats,
  exportProjects,
  exportTasks,
  exportAll,
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate
};
