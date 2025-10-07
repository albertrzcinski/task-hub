import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../api/client';

const schema = z.object({
  title: z.string().min(3, 'Minimum 3 znaki'),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    api.listTasks().then(setTasks).catch(() => setTasks([]));
  }, []);

  const onSubmit = async (values: FormValues) => {
    const created = await api.createTask(values);
    setTasks((prev) => [created, ...prev]);
    reset();
  };

  return (
    <>
      <Helmet>
        <title>Zadania — TaskHub</title>
      </Helmet>
      <Typography variant="h4" component="h1" gutterBottom>
        Zadania
      </Typography>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField label="Tytuł" {...register('title')} error={!!errors.title} helperText={errors.title?.message} required />
          <TextField label="Opis" {...register('description')} />
          <Button type="submit" variant="contained" disabled={isSubmitting}>Dodaj</Button>
        </Stack>
      </Box>
      <Stack spacing={1}>
        {tasks.map((t) => (
          <Box key={t.id} p={2} borderRadius={1} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1">{t.title}</Typography>
            {t.description && <Typography variant="body2" color="text.secondary">{t.description}</Typography>}
          </Box>
        ))}
      </Stack>
    </>
  );
}
