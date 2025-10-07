import { http, HttpResponse } from 'msw';
import { fakerPL as faker } from '@faker-js/faker';

let isLoggedIn = false;
let tasks = Array.from({ length: 25 }).map((_, i) => ({
  id: String(i + 1),
  title: faker.lorem.sentence({ min: 3, max: 6 }),
  description: faker.lorem.paragraph(),
  status: ['todo', 'in_progress', 'done'][i % 3],
  priority: ['low', 'med', 'high'][i % 3],
  dueDate: new Date(Date.now() + i * 86400000).toISOString(),
  tags: ['frontend', 'react'].slice(0, (i % 2) + 1),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

export const handlers = [
  http.post('/api/auth/login', async () => {
    isLoggedIn = true;
    return HttpResponse.json({ ok: true });
  }),
  http.post('/api/auth/logout', async () => {
    isLoggedIn = false;
    return HttpResponse.json({ ok: true });
  }),
  http.post('/api/auth/refresh', async () => {
    if (!isLoggedIn) return new HttpResponse(null, { status: 401 });
    return HttpResponse.json({ ok: true });
  }),
  http.get('/api/auth/me', async () => {
    if (!isLoggedIn) return new HttpResponse(null, { status: 401 });
    return HttpResponse.json({ id: 'u1', email: 'user@taskhub.dev', name: 'Użytkownik' });
  }),
  http.get('/api/tasks', async () => {
    if (!isLoggedIn) return new HttpResponse(null, { status: 401 });
    return HttpResponse.json(tasks);
  }),
  http.post('/api/tasks', async ({ request }) => {
    if (!isLoggedIn) return new HttpResponse(null, { status: 401 });
    const body = (await request.json()) as any;
    const newTask = { ...body, id: String(tasks.length + 1), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    tasks.unshift(newTask);
    return HttpResponse.json(newTask, { status: 201 });
  }),
];
