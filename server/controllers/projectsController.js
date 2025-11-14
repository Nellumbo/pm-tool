const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

/**
 * Получить все проекты
 */
const getAllProjects = (req, res, projects) => {
  res.json(projects);
};

/**
 * Получить проект по ID
 */
const getProjectById = (req, res, projects) => {
  const project = projects.find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ message: 'Проект не найден' });
  }
  res.json(project);
};

/**
 * Создать новый проект
 */
const createProject = (req, res, projects) => {
  const { name, description, startDate, endDate, status = 'active', managerId } = req.body;
  const newProject = {
    id: uuidv4(),
    name,
    description,
    startDate,
    endDate,
    status,
    managerId,
    createdAt: moment().format(),
    updatedAt: moment().format()
  };
  projects.push(newProject);
  res.json(newProject);
};

/**
 * Обновить проект
 */
const updateProject = (req, res, projects) => {
  const projectIndex = projects.findIndex(p => p.id === req.params.id);
  if (projectIndex === -1) {
    return res.status(404).json({ message: 'Проект не найден' });
  }

  const updatedProject = {
    ...projects[projectIndex],
    ...req.body,
    updatedAt: moment().format()
  };
  projects[projectIndex] = updatedProject;
  res.json(updatedProject);
};

/**
 * Удалить проект
 */
const deleteProject = (req, res, projects, tasks) => {
  const projectIndex = projects.findIndex(p => p.id === req.params.id);
  if (projectIndex === -1) {
    return res.status(404).json({ message: 'Проект не найден' });
  }

  // Удаляем все задачи проекта
  const filteredTasks = tasks.filter(task => task.projectId !== req.params.id);
  // Обновляем массив tasks (передаем по ссылке)
  tasks.length = 0;
  tasks.push(...filteredTasks);

  projects.splice(projectIndex, 1);
  res.json({ message: 'Проект удален' });
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
