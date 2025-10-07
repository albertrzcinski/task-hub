import { render, screen } from '@testing-library/react';
import HomePage from './HomePage';
import { HelmetProvider } from 'react-helmet-async';

test('renders welcome message', () => {
  render(
    <HelmetProvider>
      <HomePage />
    </HelmetProvider>,
  );
  expect(screen.getByRole('heading', { level: 1, name: /Witaj w TaskHub/i })).toBeInTheDocument();
});
