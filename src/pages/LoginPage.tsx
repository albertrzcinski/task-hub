import { Helmet } from 'react-helmet-async';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

type FormValues = { email: string; password: string };

export default function LoginPage() {
  const { login } = useSession();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location.state?.from?.pathname || '/';
  const { register, handleSubmit, formState: { isSubmitting, errors }, setError } = useForm<FormValues>();

  const onSubmit = async ({ email, password }: FormValues) => {
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      setError('root', { message: 'Logowanie nie powiodło się' });
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
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2} sx={{ maxWidth: 400 }}>
          <TextField label="Email" type="email" required {...register('email', { required: 'Podaj email' })} error={!!errors.email} helperText={errors.email?.message} />
          <TextField label="Hasło" type="password" required {...register('password', { required: 'Podaj hasło' })} error={!!errors.password} helperText={errors.password?.message} />
          {errors.root?.message && <Alert severity="error">{errors.root?.message}</Alert>}
          <Button type="submit" variant="contained" disabled={isSubmitting}>Zaloguj</Button>
        </Stack>
      </Box>
    </>
  );
}
