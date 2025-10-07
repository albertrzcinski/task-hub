import '@testing-library/jest-dom';

let server: { listen: () => void; resetHandlers: () => void; close: () => void } = {
  listen: () => {},
  resetHandlers: () => {},
  close: () => {},
};

beforeAll(async () => {
  try {
    const { setupServer } = await import('msw/node');
    const { handlers } = await import('../mocks/handlers');
    server = setupServer(...handlers);
    server.listen();
  } catch {
    // MSW optional for tests not hitting network
  }
});

afterEach(() => server.resetHandlers());
afterAll(() => server.close());
