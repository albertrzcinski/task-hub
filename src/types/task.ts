export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'med' | 'high';

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  assignee?: string;
};

export type CreateTaskRequest = Pick<
  Task,
  'title' | 'description' | 'status' | 'priority' | 'dueDate'
>;
export type UpdateTaskRequest = Partial<CreateTaskRequest> & { id: string };

// Pagination types for enhanced API
export type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type TaskListResponse = {
  tasks: Task[];
  pagination: PaginationInfo;
};

export type TaskListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: TaskStatus;
};
