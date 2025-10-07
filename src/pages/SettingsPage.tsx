import { Helmet } from 'react-helmet-async';
import { Button, Stack, Typography } from '@mui/material';
import { useThemeContext } from '../context/ThemeContext';

export default function SettingsPage() {
  const { mode, toggleMode } = useThemeContext();
  return (
    <>
      <Helmet>
        <title>Ustawienia — TaskHub</title>
      </Helmet>
      <Typography variant="h4" component="h1" gutterBottom>
        Ustawienia
      </Typography>
      <Stack direction="row" spacing={2}>
        <Typography>Bieżący motyw: {mode}</Typography>
        <Button onClick={toggleMode} variant="outlined">
          Przełącz motyw
        </Button>
      </Stack>
    </>
  );
}
