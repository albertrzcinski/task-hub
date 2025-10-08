import { Helmet } from 'react-helmet-async';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { useState } from 'react';

type FormValues = { email: string; password: string };

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useSession();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location.state?.from?.pathname || '/';
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
  } = useForm<FormValues>();

  const onSubmit = async ({ email, password }: FormValues) => {
    setIsLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.status === 404) {
        setError('root', { message: 'Nieprawidłowy email lub hasło' });
      } else {
        setError('root', { message: 'Logowanie nie powiodło się' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Logowanie — TaskHub</title>
      </Helmet>
      <Typography variant="h4" component="h1" gutterBottom>
        Logowanie
      </Typography>
      <Alert severity="info" sx={{ mb: 3, maxWidth: 400 }}>
        <strong>Demo:</strong> user@taskhub.dev / password
      </Alert>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2} sx={{ maxWidth: 400 }}>
          <TextField
            label="Email"
            type="email"
            autoFocus
            required
            {...register('email', { required: 'Podaj email' })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            label="Hasło"
            type="password"
            required
            {...register('password', { required: 'Podaj hasło' })}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          {errors.root?.message && <Alert severity="error">{errors.root?.message}</Alert>}
          <Button type="submit" variant="contained" disabled={isSubmitting || isLoading}>
            {isLoading ? 'Ładowanie...' : 'Zaloguj'}
          </Button>
        </Stack>
      </Box>
    </>
  );
}
