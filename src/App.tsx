import { Suspense, lazy, useMemo } from 'react';
import { Route, Routes, Navigate, Link } from 'react-router-dom';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { AppBar, Box, Container, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Helmet } from 'react-helmet-async';
import { useThemeContext } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';

const HomePage = lazy(() => import('./pages/HomePage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

export default function App() {
  const { mode } = useThemeContext();

  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode },
        typography: { fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif' },
      }),
    [mode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Helmet>
        <title>TaskHub</title>
      </Helmet>
      <AppBar position="sticky" color="primary">
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              TaskHub
            </Link>
          </Typography>
          <Box component="nav" aria-label="Główna nawigacja">
            <Link to="/tasks" className="nav-link">
              Zadania
            </Link>
            <Link to="/settings" className="nav-link">
              Ustawienia
            </Link>
          </Box>
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ py: 3 }}>
        <Suspense fallback={<p>Ładowanie…</p>}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Container>
    </ThemeProvider>
  );
}
