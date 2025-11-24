import api from '../api/axios';

export interface UserRegisterData {
  name: string;
  email: string;
  password: string;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface TaskData {
  title: string;
  description?: string;
  status?: 'todo' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

// ----------------------
// User APIs
// ----------------------
export const registerUser = (data: UserRegisterData) => api.post('/users/register', data);
export const loginUser = (data: UserLoginData) => api.post('/users/login', data);
export const logoutUser = () => {
  localStorage.removeItem('token');
};

// ----------------------
// Task APIs
// ----------------------
export const getTasks = (page = 1, limit = 10, search?: string, status?: string) => {
  const params: any = { page, limit };
  if (search) params.search = search;
  if (status) params.status = status;
  return api.get('/tasks', { params });
};

export const getTaskById = (id: number) => api.get(`/tasks/${id}`);
export const createTask = (task: TaskData) => api.post('/tasks', task);
export const updateTask = (id: number, task: TaskData) => api.put(`/tasks/${id}`, task);
export const deleteTask = (id: number) => api.delete(`/tasks/${id}`);
export const toggleTaskStatus = (id: number) => api.patch(`/tasks/toggle/${id}`);
