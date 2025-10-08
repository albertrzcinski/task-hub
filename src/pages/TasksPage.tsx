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
  CircularProgress,
  Pagination,
  Skeleton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '../api/client';
import type {
  Task,
  CreateTaskRequest as _CreateTaskRequest,
  UpdateTaskRequest as _UpdateTaskRequest,
  TaskListResponse as _TaskListResponse,
  PaginationInfo,
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
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [filter, setFilter] = useState<'all' | Task['status']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

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

  // Load tasks function with enhanced loading states
  const loadTasks = async (page = 1, search = '', statusFilter?: Task['status']) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        page,
        limit: 10,
        search: search.trim() || undefined,
        status: statusFilter,
      };

      const response = await api.listTasks(params);
      setTasks(response.tasks);
      setPagination(response.pagination);
      setCurrentPage(page);
    } catch {
      setTasks([]);
      setPagination(null);
      setError('Nie udało się pobrać zadań. Sprawdź połączenie sieciowe.');
    } finally {
      setIsLoading(false);
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadTasks(1, searchQuery, filter !== 'all' ? filter : undefined);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filter, searchQuery]); // Debounced search with filter

  const onCreateSubmit = async (values: CreateFormValues) => {
    try {
      setError(null);
      await api.createTask(values);
      // Refresh the current page to show the new task
      await loadTasks(1, searchQuery, filter !== 'all' ? filter : undefined);
      resetCreate();
    } catch {
      setError('Nie udało się dodać zadania. Spróbuj ponownie.');
    }
  };

  const onEditSubmit = async (values: EditFormValues) => {
    if (!editingTask) return;
    try {
      setError(null);
      const updated = await api.updateTask({ ...values, id: editingTask.id });
      // Update the task in current list optimistically
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setEditingTask(null);
      resetEdit();
    } catch {
      setError('Nie udało się zaktualizować zadania. Spróbuj ponownie.');
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
      // Remove from current list optimistically
      setTasks((prev) => prev.filter((t) => t.id !== id));
      // Update pagination if needed
      if (pagination) {
        setPagination((prev) => (prev ? { ...prev, total: prev.total - 1 } : null));
      }
    } catch {
      setError('Nie udało się usunąć zadania. Spróbuj ponownie.');
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    loadTasks(page, searchQuery, filter !== 'all' ? filter : undefined);
  };

  const getStatusLabel = (status: Task['status']) => {
    const labels = { todo: 'Do zrobienia', in_progress: 'W trakcie', done: 'Zakończone' };
    return labels[status];
  };

  const getPriorityColor = (priority: Task['priority']) => {
    const colors = { low: 'success', med: 'warning', high: 'error' } as const;
    return colors[priority];
  };

  // Loading skeleton component
  const TaskSkeleton = () => (
    <Box
      p={2}
      borderRadius={1}
      sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}
    >
      <Stack spacing={1}>
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="80%" height={20} />
        <Stack direction="row" spacing={1}>
          <Skeleton variant="rectangular" width={80} height={24} />
          <Skeleton variant="rectangular" width={60} height={24} />
          <Skeleton variant="rectangular" width={100} height={24} />
        </Stack>
      </Stack>
    </Box>
  );

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

      {/* Search and Filter */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          placeholder="Szukaj zadań..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ flexGrow: 1 }}
          size="small"
        />
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
      </Stack>

      {/* Create form */}
      <Box component="form" onSubmit={handleCreateSubmit(onCreateSubmit)} noValidate sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Tytuł"
            {...registerCreate('title')}
            error={!!createErrors.title}
            helperText={createErrors.title?.message}
            required
            disabled={isLoading}
          />
          <TextField label="Opis" {...registerCreate('description')} disabled={isLoading} />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              {...registerCreate('status')}
              label="Status"
              defaultValue="todo"
              disabled={isLoading}
            >
              <MenuItem value="todo">Do zrobienia</MenuItem>
              <MenuItem value="in_progress">W trakcie</MenuItem>
              <MenuItem value="done">Zakończone</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Priorytet</InputLabel>
            <Select
              {...registerCreate('priority')}
              label="Priorytet"
              defaultValue="med"
              disabled={isLoading}
            >
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
            disabled={isLoading}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={isCreating || isLoading}
            startIcon={isCreating ? <CircularProgress size={16} /> : undefined}
          >
            {isCreating ? 'Dodawanie...' : 'Dodaj'}
          </Button>
        </Stack>
      </Box>

      {/* Tasks list */}
      {isInitialLoading ? (
        <Stack spacing={1}>
          {Array.from({ length: 3 }).map((_, index) => (
            <TaskSkeleton key={index} />
          ))}
        </Stack>
      ) : tasks.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            {searchQuery ? 'Nie znaleziono zadań' : 'Brak zadań'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery ? 'Spróbuj zmienić wyszukiwanie' : 'Dodaj pierwsze zadanie aby rozpocząć'}
          </Typography>
        </Box>
      ) : (
        <>
          <Stack spacing={1} sx={{ mb: 3 }}>
            {tasks.map((task) => (
              <Box
                key={task.id}
                p={2}
                borderRadius={1}
                sx={{
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  opacity: isLoading ? 0.7 : 1,
                  transition: 'opacity 0.2s',
                }}
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
                      disabled={isLoading}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(task.id)}
                      aria-label={`Usuń zadanie ${task.title}`}
                      color="error"
                      disabled={isLoading}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Box display="flex" justifyContent="center" sx={{ mt: 3 }}>
              <Pagination
                count={pagination.totalPages}
                page={currentPage}
                onChange={handlePageChange}
                disabled={isLoading}
                showFirstButton
                showLastButton
              />
            </Box>
          )}

          {/* Loading overlay for pagination */}
          {isLoading && !isInitialLoading && (
            <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </>
      )}

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
