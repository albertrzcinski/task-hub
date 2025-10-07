import { Helmet } from 'react-helmet-async';
import { Typography } from '@mui/material';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>TaskHub — Strona główna</title>
      </Helmet>
      <Typography variant="h4" component="h1" gutterBottom>
        Witaj w TaskHub
      </Typography>
      <Typography>Przejdź do sekcji „Zadania”, aby zarządzać swoją listą.</Typography>
    </>
  );
}
