import { render, screen } from '@testing-library/react';
import SettingsPage from './SettingsPage';
import { HelmetProvider } from 'react-helmet-async';

const mockToggleMode = jest.fn();
const mockLogout = jest.fn();

jest.mock('../context/SessionContext', () => ({
  useSession: () => ({
    logout: mockLogout,
  }),
}));

jest.mock('../context/ThemeContext', () => ({
  useThemeContext: () => ({
    mode: 'light',
    toggleMode: mockToggleMode,
  }),
}));

test('renders settings page', () => {
  render(
    <HelmetProvider>
      <SettingsPage />
    </HelmetProvider>,
  );
  expect(screen.getByText(/ustawienia/i)).toBeInTheDocument();
  expect(screen.getByText(/bieżący motyw/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /przełącz motyw/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /wyloguj się/i })).toBeInTheDocument();
});

test('toggles theme mode on button click', () => {
  render(
    <HelmetProvider>
      <SettingsPage />
    </HelmetProvider>,
  );
  const toggleButton = screen.getByRole('button', { name: /przełącz motyw/i });
  toggleButton.click();
  expect(mockToggleMode).toHaveBeenCalled();
});

test('calls logout on button click', () => {
  render(
    <HelmetProvider>
      <SettingsPage />
    </HelmetProvider>,
  );
  const logoutButton = screen.getByRole('button', { name: /wyloguj się/i });
  logoutButton.click();
  expect(mockLogout).toHaveBeenCalled();
});
