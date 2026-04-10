// hooks/useTodo.ts
import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import type { Todo } from '../types/Todo';

// URL de tu backend
const API_URL = import.meta.env.VITE_API_BACKEND_URL;

// Configuración de Axios
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // GET: OBTENER TODAS LAS TAREAS ---
const fetchTodos = async () => {
  setIsLoading(true);
  setError(null);
  setValidationError(null);
  try {
    const response = await apiClient.get('/');
    
    // Verificar si response.data es un array
    let tasksArray = [];
    
    if (Array.isArray(response.data)) {
      // Si es un array, usarlo directamente
      tasksArray = response.data;
    } else if (response.data && typeof response.data === 'object') {
      // Si es un objeto, verificar si tiene una propiedad que contenga el array
      if (Array.isArray(response.data.tasks)) {
        tasksArray = response.data.tasks;
      } else if (Array.isArray(response.data.data)) {
        tasksArray = response.data.data;
      } else if (Array.isArray(response.data.docs)) {
        tasksArray = response.data.docs;
      } else {
        // Si no se encuentra un array, mostrar error
        setError('Formato de respuesta inválido del servidor');
        setTodos([]);
        return;
      }
    } else {
      setError('Formato de respuesta inválido del servidor');
      setTodos([]);
      return;
    }
    
    // Mapear las tareas solo si tasksArray es un array
    const mappedTodos: Todo[] = tasksArray.map((task: any) => ({
      id: task._id || task.id,
      title: task.title || 'Sin título',
      description: task.description || '',
      completed: task.completed ?? false,
      created_at: task.createdAt || task.created_at || new Date().toISOString(),
      updated_at: task.updatedAt || task.updated_at || new Date().toISOString()
    }));
    
    setTodos(mappedTodos);
  } catch (err) {
    console.error('Error fetching todos:', err);
    if (err instanceof AxiosError) {
      setError(err.response?.data?.message || 'Error al conectar con el servidor');
    } else {
      setError('Error al conectar con el servidor');
    }
    setTodos([]);
  } finally {
    setIsLoading(false);
  }
};
  // --- FUNCIÓN DE VALIDACIÓN REUTILIZABLE ---
  const validateTodo = (title: string, description: string): boolean => {
    if (!title || title.trim() === '') {
      setValidationError(' El título es obligatorio');
      return false;
    }
    
    if (title.length < 3) {
      setValidationError(' El título debe tener al menos 3 caracteres');
      return false;
    }
    
    if (title.length > 100) {
      setValidationError(' El título no puede exceder los 100 caracteres');
      return false;
    }
    
    if (!description || description.trim() === '') {
      setValidationError(' La descripción es obligatoria');
      return false;
    }
    
    if (description.length < 5) {
      setValidationError(' La descripción debe tener al menos 5 caracteres');
      return false;
    }
    
    if (description.length > 500) {
      setValidationError(' La descripción no puede exceder los 500 caracteres');
      return false;
    }
    
    setValidationError(null);
    return true;
  };

 // POST - agregar tarea ---
const addTodo = async (title: string, description: string) => {
  setError(null);
  setValidationError(null);
  
  // Validar
  if (!validateTodo(title, description)) {
    throw new Error('Validación fallida');
  }
  
  try {
    const newTodoRequest = { 
      title: title.trim(), 
      description: description.trim(), 
      completed: false
    };
    
    const response = await apiClient.post('/', newTodoRequest);
    console.log('Respuesta del servidor al crear:', response.data);
    
    // 🔥 IMPORTANTE: Manejar diferentes estructuras de respuesta
    let savedTask = response.data;
    
    // Si la respuesta tiene wrapper { success, data }
    if (savedTask.data && savedTask.success !== undefined) {
      savedTask = savedTask.data;
    }
    
    // Validar que savedTask tenga _id
    if (!savedTask || !savedTask._id) {
      console.error('Respuesta inválida del servidor:', savedTask);
      setError('Error: El servidor no devolvió un ID válido');
      throw new Error('ID no encontrado en la respuesta');
    }
    
    const newTodo: Todo = {
      id: savedTask._id,
      title: savedTask.title || title,
      description: savedTask.description || description,
      completed: savedTask.completed ?? false,
      created_at: savedTask.createdAt || new Date().toISOString(),
      updated_at: savedTask.updatedAt || new Date().toISOString()
    };
    
    
    setTodos((prev) => [newTodo, ...prev]);
    setSuccessMessage('Tarea creada exitosamente');
    return newTodo;
    
  } catch (err) {
    console.error(' Error en addTodo:', err);
    if (err instanceof AxiosError) {
      setError(err.response?.data?.message || 'No se pudo guardar la tarea');
    } else if (err instanceof Error && err.message === 'Validación fallida') {
      throw err;
    } else {
      setError('No se pudo guardar la tarea');
    }
    throw err;
  }
};
  // UPDATE: Actualizar título y descripción ---
const updateTodo = async (id: string | number, title: string, description: string) => {
  setError(null);
  setValidationError(null);
  
  // Validar
  if (!validateTodo(title, description)) {
    throw new Error('Validación fallida');
  }
  
  try {
    
    const response = await apiClient.put(`/${id}`, {
      title: title.trim(),
      description: description.trim(),
      completed: todos.find(t => t.id === id)?.completed || false
    });
    
    
    const updatedTask = response.data.data || response.data;
    
    
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              title: updatedTask.title,
              description: updatedTask.description || '',
              completed: updatedTask.completed,
              updated_at: updatedTask.updatedAt || new Date().toISOString()
            }
          : todo
      )
    );
    
    setSuccessMessage(' Tarea actualizada exitosamente');
    
    // Devolver la tarea actualizada
    return updatedTask;
    
  } catch (err) {
    if (err instanceof AxiosError) {
      setError(err.response?.data?.message || 'No se pudo actualizar la tarea');
    } else if (err instanceof Error && err.message === 'Validación fallida') {
      throw err;
    } else {
      setError('No se pudo actualizar la tarea');
    }
    throw err;
  }
};

//PATCH: Cambiar estado de completado ---
const toggleTodo = async (id: string | number) => {
  setError(null);

  // Buscamos la tarea actual para saber su estado
  const todoToUpdate = todos.find(t => t.id === id);
  if (!todoToUpdate) return;

  // Calculamos el nuevo estado localmente por si el backend no lo devuelve
  const newStatus = !todoToUpdate.completed;

  try {
    // Llamada a la API
    const response = await apiClient.patch(`/${id}/toggle`, {
      completed: newStatus
    });

   
    const updatedTask = response.data?.data;

    //  Actualizamos el estado de React
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              completed: updatedTask ? updatedTask.completed : newStatus,
              updated_at: updatedTask?.updated_at || updatedTask?.updatedAt || new Date().toISOString()
            }
          : todo
      )
    );
  } catch (err) {
    console.error('Error toggling todo:', err);
    
    // Manejo de errores con Axios
    if (err && typeof err === 'object' && 'isAxiosError' in err) {
      const axiosError = err as any;
      setError(axiosError.response?.data?.message || 'No se pudo cambiar el estado');
    } else {
      setError('No se pudo cambiar el estado de la tarea');
    }
  }
};

  // DELETE: ELIMINAR TAREA ---
  const deleteTodo = async (id: string | number) => {
    setError(null);
    try {
      await apiClient.delete(`/${id}`);
      setTodos((prev) => prev.filter((t) => t.id !== id));
      setSuccessMessage(' Tarea eliminada exitosamente');
    } catch (err) {
      console.error('Error deleting todo:', err);
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'No se pudo eliminar la tarea');
      } else {
        setError('No se pudo eliminar la tarea');
      }
      throw err;
    }
  };

  // Limpiar errores
  const clearErrors = () => {
    setError(null);
    setValidationError(null);
    setSuccessMessage(null);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return {
    todos,
    isLoading,
    error,
    validationError,
    successMessage,
    addTodo,
    toggleTodo,
    updateTodo,
    deleteTodo,
    refresh: fetchTodos,
    clearErrors
  };
};