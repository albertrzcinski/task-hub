import { Helmet } from 'react-helmet-async';
import { Button, Stack, Typography } from '@mui/material';
import { useThemeContext } from '../context/ThemeContext';
import { useSession } from '../context/SessionContext';

export default function SettingsPage() {
  const { mode, toggleMode } = useThemeContext();
  const { logout } = useSession();
  return (
    <>
      <Helmet>
        <title>Ustawienia — TaskHub</title>
      </Helmet>
      <Typography variant="h4" component="h1" gutterBottom>
        Ustawienia
      </Typography>
      <Typography gutterBottom>Bieżący motyw: {mode}</Typography>
      <Stack direction="row" spacing={2}>
        <Button onClick={toggleMode} variant="outlined">
          Przełącz motyw
        </Button>
        <Button variant="outlined" color="error" onClick={logout}>
          Wyloguj się
        </Button>
      </Stack>
    </>
  );
}
