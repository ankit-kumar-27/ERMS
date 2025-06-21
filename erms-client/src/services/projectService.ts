import api from '../config/api';

export const fetchProjects = async () => {
  const response = await api.get('http://localhost:3000/api/projects');
  return response.data;
};

export const createProject = async (project) => {
  const response = await api.post('http://localhost:3000/api/projects', project);
  return response.data;
};

export const createAssignment = async (assignment) => {
  const response = await api.post('http://localhost:3000/api/assignments', assignment);
  return response.data;
};

export const fetchAssignments = async () => {
  const response = await api.get('http://localhost:3000/api/assignments');
  return response.data;
};

export default {
  fetchProjects,
  createProject,
  createAssignment,
  fetchAssignments,
}; 