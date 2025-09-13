import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/ApiService';
import { notificationService } from '@/services/NotificationService';
import { Todo, CreateTodoData } from '@/types';

/**
 * Hook for managing todos with React Query
 */
export const useTodos = () => {
  return useQuery({
    queryKey: ['todos'],
    queryFn: () => apiService.getTodos(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for creating a new todo
 */
export const useCreateTodo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (todoData: CreateTodoData) => apiService.createTodo(todoData),
    onSuccess: (newTodo) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      
      // Schedule notification if due date is set
      if (newTodo.dueDate) {
        notificationService.scheduleTodoReminder(newTodo);
      }
    },
  });
};

/**
 * Hook for updating a todo
 */
export const useUpdateTodo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTodoData> }) =>
      apiService.updateTodo(id, data),
    onSuccess: (updatedTodo) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      
      // Cancel existing notification and reschedule if due date changed
      notificationService.cancelNotification('todo', updatedTodo._id);
      if (updatedTodo.dueDate) {
        notificationService.scheduleTodoReminder(updatedTodo);
      }
    },
  });
};

/**
 * Hook for deleting a todo
 */
export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteTodo(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      
      // Cancel notification for deleted todo
      notificationService.cancelNotification('todo', deletedId);
    },
  });
};

/**
 * Hook for toggling todo completion
 */
export const useToggleTodo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.toggleTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
};

/**
 * Hook for getting filtered and sorted todos
 */
export const useFilteredTodos = (
  filter: 'all' | 'active' | 'completed' = 'all',
  sortBy: 'priority' | 'dueDate' | 'category' = 'priority'
) => {
  const { data: todos = [], ...query } = useTodos();

  const filteredTodos = todos.filter((todo) => {
    switch (filter) {
      case 'active':
        return !todo.completed;
      case 'completed':
        return todo.completed;
      default:
        return true;
    }
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  return {
    ...query,
    data: sortedTodos,
  };
};

/**
 * Hook for getting todos grouped by category
 */
export const useTodosByCategory = () => {
  const { data: todos = [], ...query } = useTodos();

  const todosByCategory = todos.reduce((acc, todo) => {
    if (!acc[todo.category]) {
      acc[todo.category] = [];
    }
    acc[todo.category].push(todo);
    return acc;
  }, {} as Record<string, Todo[]>);

  return {
    ...query,
    data: todosByCategory,
  };
};

/**
 * Hook for getting todo statistics
 */
export const useTodoStats = () => {
  const { data: todos = [] } = useTodos();

  const stats = {
    total: todos.length,
    completed: todos.filter(todo => todo.completed).length,
    active: todos.filter(todo => !todo.completed).length,
    overdue: todos.filter(todo => 
      !todo.completed && 
      todo.dueDate && 
      new Date(todo.dueDate) < new Date()
    ).length,
    byPriority: {
      high: todos.filter(todo => todo.priority === 'high').length,
      medium: todos.filter(todo => todo.priority === 'medium').length,
      low: todos.filter(todo => todo.priority === 'low').length,
    },
    byCategory: todos.reduce((acc, todo) => {
      acc[todo.category] = (acc[todo.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return stats;
};

/**
 * Hook for searching todos
 */
export const useSearchTodos = (query: string) => {
  const { data: todos = [] } = useTodos();

  const searchResults = todos.filter((todo) => {
    if (!query.trim()) return true;
    
    const searchTerm = query.toLowerCase();
    return (
      todo.title.toLowerCase().includes(searchTerm) ||
      todo.category.toLowerCase().includes(searchTerm) ||
      todo.priority.toLowerCase().includes(searchTerm)
    );
  });

  return searchResults;
};

/**
 * Hook for getting overdue todos
 */
export const useOverdueTodos = () => {
  const { data: todos = [] } = useTodos();
  
  const overdueTodos = todos.filter(todo => 
    !todo.completed && 
    todo.dueDate && 
    new Date(todo.dueDate) < new Date()
  );

  return overdueTodos;
};

/**
 * Hook for scheduling overdue notifications
 */
export const useScheduleOverdueNotifications = () => {
  const overdueTodos = useOverdueTodos();
  
  const scheduleNotifications = () => {
    if (overdueTodos.length > 0) {
      notificationService.scheduleOverdueReminder(overdueTodos);
    }
  };

  return { scheduleNotifications, overdueCount: overdueTodos.length };
};