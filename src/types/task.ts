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
