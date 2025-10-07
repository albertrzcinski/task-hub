import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../api/client';
import type {
  Task,
  CreateTaskRequest as _CreateTaskRequest,
  UpdateTaskRequest as _UpdateTaskRequest,
} from '../types/task';

const createSchema = z.object({
  title: z.string().min(3, 'Minimum 3 znaki'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  priority: z.enum(['low', 'med', 'high']).default('med'),
  dueDate: z.string().optional(),
});

const editSchema = z.object({
  title: z.string().min(3, 'Minimum 3 znaki'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']),
  priority: z.enum(['low', 'med', 'high']),
  dueDate: z.string().optional(),
});

type CreateFormValues = z.infer<typeof createSchema>;
type EditFormValues = z.infer<typeof editSchema>;

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | Task['status']>('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreate,
    formState: { errors: createErrors, isSubmitting: isCreating },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { status: 'todo', priority: 'med' },
  });

  // Edit form
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    setValue: setEditValue,
    formState: { errors: editErrors, isSubmitting: isEditing },
  } = useForm<EditFormValues>({ resolver: zodResolver(editSchema) });

  useEffect(() => {
    api
      .listTasks()
      .then(setTasks)
      .catch((_err) => {
        setTasks([]);
        setError('Nie udało się pobrać zadań');
      });
  }, []);

  const onCreateSubmit = async (values: CreateFormValues) => {
    try {
      setError(null);
      const created = await api.createTask(values);
      setTasks((prev) => [created, ...prev]);
      resetCreate();
    } catch {
      setError('Nie udało się dodać zadania');
    }
  };

  const onEditSubmit = async (values: EditFormValues) => {
    if (!editingTask) return;
    try {
      setError(null);
      const updated = await api.updateTask({ ...values, id: editingTask.id });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setEditingTask(null);
      resetEdit();
    } catch {
      setError('Nie udało się zaktualizować zadania');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setEditValue('title', task.title);
    setEditValue('description', task.description || '');
    setEditValue('status', task.status);
    setEditValue('priority', task.priority);
    setEditValue('dueDate', task.dueDate || '');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć to zadanie?')) return;
    try {
      setError(null);
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError('Nie udało się usunąć zadania');
    }
  };

  const filteredTasks = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  const getStatusLabel = (status: Task['status']) => {
    const labels = { todo: 'Do zrobienia', in_progress: 'W trakcie', done: 'Zakończone' };
    return labels[status];
  };

  const getPriorityColor = (priority: Task['priority']) => {
    const colors = { low: 'success', med: 'warning', high: 'error' } as const;
    return colors[priority];
  };

  return (
    <>
      <Helmet>
        <title>Zadania — TaskHub</title>
      </Helmet>
      <Typography variant="h4" component="h1" gutterBottom>
        Zadania
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filter */}
      <Box sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filtruj według statusu</InputLabel>
          <Select
            value={filter}
            label="Filtruj według statusu"
            onChange={(e) => setFilter(e.target.value as typeof filter)}
          >
            <MenuItem value="all">Wszystkie</MenuItem>
            <MenuItem value="todo">Do zrobienia</MenuItem>
            <MenuItem value="in_progress">W trakcie</MenuItem>
            <MenuItem value="done">Zakończone</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Create form */}
      <Box component="form" onSubmit={handleCreateSubmit(onCreateSubmit)} noValidate sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Tytuł"
            {...registerCreate('title')}
            error={!!createErrors.title}
            helperText={createErrors.title?.message}
            required
          />
          <TextField label="Opis" {...registerCreate('description')} />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select {...registerCreate('status')} label="Status" defaultValue="todo">
              <MenuItem value="todo">Do zrobienia</MenuItem>
              <MenuItem value="in_progress">W trakcie</MenuItem>
              <MenuItem value="done">Zakończone</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Priorytet</InputLabel>
            <Select {...registerCreate('priority')} label="Priorytet" defaultValue="med">
              <MenuItem value="low">Niski</MenuItem>
              <MenuItem value="med">Średni</MenuItem>
              <MenuItem value="high">Wysoki</MenuItem>
            </Select>
          </FormControl>
          <TextField
            type="date"
            label="Termin"
            {...registerCreate('dueDate')}
            InputLabelProps={{ shrink: true }}
          />
          <Button type="submit" variant="contained" disabled={isCreating}>
            Dodaj
          </Button>
        </Stack>
      </Box>

      {/* Tasks list */}
      <Stack spacing={1}>
        {filteredTasks.map((task) => (
          <Box
            key={task.id}
            p={2}
            borderRadius={1}
            sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1">{task.title}</Typography>
                {task.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {task.description}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <Chip label={getStatusLabel(task.status)} size="small" variant="outlined" />
                  <Chip
                    label={task.priority}
                    size="small"
                    color={getPriorityColor(task.priority)}
                  />
                  {task.dueDate && (
                    <Chip
                      label={new Date(task.dueDate).toLocaleDateString('pl')}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>
                {task.tags.length > 0 && (
                  <Stack direction="row" spacing={0.5}>
                    {task.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Stack>
                )}
              </Box>
              <Stack direction="row" spacing={1}>
                <IconButton
                  size="small"
                  onClick={() => handleEdit(task)}
                  aria-label={`Edytuj zadanie ${task.title}`}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(task.id)}
                  aria-label={`Usuń zadanie ${task.title}`}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          </Box>
        ))}
      </Stack>

      {/* Edit Dialog */}
      <Dialog open={!!editingTask} onClose={() => setEditingTask(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edytuj zadanie</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ pt: 1 }}>
            <Stack spacing={2}>
              <TextField
                label="Tytuł"
                {...registerEdit('title')}
                error={!!editErrors.title}
                helperText={editErrors.title?.message}
                required
                fullWidth
              />
              <TextField
                label="Opis"
                {...registerEdit('description')}
                multiline
                rows={3}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select {...registerEdit('status')} label="Status">
                  <MenuItem value="todo">Do zrobienia</MenuItem>
                  <MenuItem value="in_progress">W trakcie</MenuItem>
                  <MenuItem value="done">Zakończone</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Priorytet</InputLabel>
                <Select {...registerEdit('priority')} label="Priorytet">
                  <MenuItem value="low">Niski</MenuItem>
                  <MenuItem value="med">Średni</MenuItem>
                  <MenuItem value="high">Wysoki</MenuItem>
                </Select>
              </FormControl>
              <TextField
                type="date"
                label="Termin"
                {...registerEdit('dueDate')}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingTask(null)}>Anuluj</Button>
          <Button onClick={handleEditSubmit(onEditSubmit)} variant="contained" disabled={isEditing}>
            Zapisz
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
