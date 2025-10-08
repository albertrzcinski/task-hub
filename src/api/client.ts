import axios from 'axios';
import type { LoginRequest, LoginResponse, User } from '../types/user';
import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskListResponse,
  TaskListParams,
} from '../types/task';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // for httpOnly cookies in real backend
  timeout: 10000,
});

let isRefreshing = false;
let pendingRequests: Array<(token: string | null) => void> = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error || {};
    if (!response) throw error;

    // Handle 401 with refresh token logic
    if (response.status === 401 && !config._retry) {
      config._retry = true;
      try {
        const token = await refreshToken();
        pendingRequests.forEach((cb) => cb(token));
        pendingRequests = [];
        return apiClient(config);
      } catch (e) {
        pendingRequests.forEach((cb) => cb(null));
        pendingRequests = [];
        throw e;
      }
    }

    // Handle rate limiting
    if (response.status === 429) {
      await new Promise((r) => setTimeout(r, 1000));
      return apiClient(config);
    }

    throw error;
  },
);

async function refreshToken(): Promise<string> {
  if (isRefreshing) {
    return new Promise((resolve) => pendingRequests.push(() => resolve('refreshed')));
  }
  isRefreshing = true;
  try {
    await apiClient.post('/auth/refresh');
    return 'refreshed';
  } finally {
    isRefreshing = false;
  }
}

export const api = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
    return data;
  },
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },
  async getMe(): Promise<User> {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },
  async listTasks(params: TaskListParams = {}): Promise<TaskListResponse> {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.status) searchParams.set('status', params.status);

    const query = searchParams.toString();
    const url = query ? `/tasks?${query}` : '/tasks';

    const { data } = await apiClient.get<TaskListResponse>(url);
    return data;
  },
  async createTask(task: CreateTaskRequest): Promise<Task> {
    const { data } = await apiClient.post<Task>('/tasks', task);
    return data;
  },
  async updateTask(updates: UpdateTaskRequest): Promise<Task> {
    const { data } = await apiClient.put<Task>(`/tasks/${updates.id}`, updates);
    return data;
  },
  async deleteTask(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },
};
