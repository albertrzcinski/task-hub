import { http, HttpResponse } from 'msw';
import { fakerPL as faker } from '@faker-js/faker';
import type { Task } from '../types/task';

// Simple network delay simulation
const simulateDelay = async (ms: number = 500) => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};

// Simulate session persistence like in real app with localStorage
const getSessionState = () => {
  try {
    return localStorage.getItem('demo-session') === 'logged-in';
  } catch {
    return false; // Default to logged out - require explicit login
  }
};

const setSessionState = (loggedIn: boolean) => {
  try {
    if (loggedIn) {
      localStorage.setItem('demo-session', 'logged-in');
    } else {
      localStorage.removeItem('demo-session');
    }
  } catch {
    // Ignore localStorage errors
  }
};

let isLoggedIn = getSessionState();

// Generate more realistic mock data
const generateTask = (id: number): Task => ({
  id: String(id),
  title: faker.lorem.sentence({ min: 3, max: 8 }),
  description: Math.random() > 0.3 ? faker.lorem.paragraph() : undefined,
  status: ['todo', 'in_progress', 'done'][Math.floor(Math.random() * 3)] as Task['status'],
  priority: ['low', 'med', 'high'][Math.floor(Math.random() * 3)] as Task['priority'],
  dueDate:
    Math.random() > 0.5
      ? new Date(Date.now() + Math.random() * 30 * 86400000).toISOString()
      : undefined,
  tags: faker.helpers.arrayElements(['frontend', 'backend', 'design', 'urgent', 'bug', 'feature'], {
    min: 0,
    max: 3,
  }),
  createdAt: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
});

let tasks: Task[] = Array.from({ length: 25 }, (_, i) => generateTask(i + 1));

export const handlers = [
  http.post('/api/auth/login', async ({ request }: { request: Request }) => {
    await simulateDelay(400);

    const { email, password } = await request.json();
    const VALID_USERS = [{ email: 'user@taskhub.dev', password: 'password' }];
    const user = VALID_USERS.find((u) => u.email === email && u.password === password);
    if (!user) {
      return new HttpResponse(null, { status: 404 });
    }
    isLoggedIn = true;
    setSessionState(true);
    return HttpResponse.json({ ok: true });
  }),

  http.post('/api/auth/logout', async () => {
    await simulateDelay(300);

    isLoggedIn = false;
    setSessionState(false);
    return HttpResponse.json({ ok: true });
  }),

  http.post('/api/auth/refresh', async () => {
    await simulateDelay(200);

    if (!isLoggedIn) return new HttpResponse(null, { status: 401 });
    return HttpResponse.json({ ok: true });
  }),

  http.get('/api/auth/me', async () => {
    await simulateDelay(300);

    if (!isLoggedIn) return new HttpResponse(null, { status: 401 });
    return HttpResponse.json({ id: 'u1', email: 'user@taskhub.dev', name: 'Użytkownik' });
  }),

  http.get('/api/tasks', async ({ request }) => {
    await simulateDelay(600); // Tasks endpoint is a bit slower

    if (!isLoggedIn) return new HttpResponse(null, { status: 401 });

    // Simulate pagination
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '25');
    const search = url.searchParams.get('search') || '';

    let filteredTasks = tasks;

    // Simulate search
    if (search) {
      filteredTasks = tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(search.toLowerCase()) ||
          task.description?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Simulate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

    return HttpResponse.json({
      tasks: paginatedTasks,
      pagination: {
        page,
        limit,
        total: filteredTasks.length,
        totalPages: Math.ceil(filteredTasks.length / limit),
        hasNext: endIndex < filteredTasks.length,
        hasPrev: page > 1,
      },
    });
  }),

  http.post('/api/tasks', async ({ request }) => {
    await simulateDelay(500);

    if (!isLoggedIn) return new HttpResponse(null, { status: 401 });
    const body = (await request.json()) as any;
    const newTask: Task = {
      ...generateTask(tasks.length + 1),
      ...body,
      id: String(tasks.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.unshift(newTask);
    return HttpResponse.json(newTask, { status: 201 });
  }),

  http.put('/api/tasks/:id', async ({ params, request }) => {
    await simulateDelay(450);

    if (!isLoggedIn) return new HttpResponse(null, { status: 401 });
    const { id } = params;
    const updates = (await request.json()) as any;
    const taskIndex = tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) return new HttpResponse(null, { status: 404 });

    tasks[taskIndex] = { ...tasks[taskIndex], ...updates, updatedAt: new Date().toISOString() };
    return HttpResponse.json(tasks[taskIndex]);
  }),

  http.delete('/api/tasks/:id', async ({ params }) => {
    await simulateDelay(400);

    if (!isLoggedIn) return new HttpResponse(null, { status: 401 });
    const { id } = params;
    const taskIndex = tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) return new HttpResponse(null, { status: 404 });

    tasks.splice(taskIndex, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
