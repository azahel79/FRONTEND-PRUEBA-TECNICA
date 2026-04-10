import React, { useState} from 'react';
import { useTodos } from './hooks/useTodo';
import { TodoItem } from './components/Todoitem';
import { Header } from './components/layout/Header';
import { ErrorNotification } from './components/ErrorNotification';
import type { Todo } from './types/Todo';

const App: React.FC = () => {
  const { 
    todos, 
    addTodo, 
    toggleTodo, 
    deleteTodo, 
    updateTodo, 
    isLoading,
    error,
    validationError,
    successMessage,
    clearErrors
  } = useTodos();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado para errores del formulario
  const [formErrors, setFormErrors] = useState<{ title?: string; description?: string }>({});

  // Validación del formulario
  const validateForm = (): boolean => {
    const errors: { title?: string; description?: string } = {};
    
    if (!title.trim()) {
      errors.title = 'El título es obligatorio';
    } else if (title.length < 3) {
      errors.title = 'El título debe tener al menos 3 caracteres';
    } else if (title.length > 100) {
      errors.title = 'El título no puede exceder 100 caracteres';
    }
    
    if (description.length > 500) {
      errors.description = 'La descripción no puede exceder 500 caracteres';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Evitar envíos múltiples
    if (isSubmitting) return;
    
    // Validar formulario antes de enviar
    if (!validateForm()) {
      console.log('❌ Errores de validación:', formErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editingId) {
        await updateTodo(editingId, title, description);
        
        // Limpiar modo edición
        setEditingId(null);
        setTitle('');
        setDescription('');
        setFormErrors({});
        
      } else {
        await addTodo(title, description);
        
        // Limpiar formulario
        setTitle('');
        setDescription('');
        setFormErrors({}); 
      }
      
    } catch (err) {
     
      console.error('Error al guardar:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (todo: Todo) => {
    setTitle(todo.title);
    setDescription(todo.description || '');
    setEditingId(todo.id);
    setFormErrors({}); 
    clearErrors();
    // Hacer scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setTitle('');
    setDescription('');
    setEditingId(null);
    setFormErrors({}); 
    clearErrors();
  };

  return (
    <div className="min-h-screen bg-neon-bg text-white font-sans selection:bg-neon-cyan/30 relative">
      <Header />

      {/* NOTIFICACIONES DE ERROR GLOBALES */}
      {error && (
        <ErrorNotification 
          message={error} 
          type="error" 
          duration={5000} 
          onClose={clearErrors} 
        />
      )}
      
      {validationError && (
        <ErrorNotification 
          message={validationError} 
          type="validation" 
          duration={5000} 
          onClose={clearErrors} 
        />
      )}
      
      {successMessage && (
        <ErrorNotification 
          message={successMessage} 
          type="success" 
          duration={3000} 
          onClose={clearErrors} 
        />
      )}
  {/* Mostrar errores de validación del formulario */}
      {(formErrors.title || formErrors.description) && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
          <div className="bg-red-500/95 border-2 border-red-400 rounded-lg shadow-2xl overflow-hidden">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-red-100 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black uppercase tracking-wider text-red-100">
                    ERRORES DE VALIDACIÓN
                  </p>
                  <div className="mt-1 space-y-1">
                    {formErrors.title && (
                      <p className="text-sm text-red-100">• {formErrors.title}</p>
                    )}
                    {formErrors.description && (
                      <p className="text-sm text-red-100">• {formErrors.description}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setFormErrors({})}
                  className="text-red-100 hover:bg-white/10 rounded-md p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="h-1 bg-white/20">
              <div className="h-full bg-red-300" style={{
                width: '100%',
                animation: 'shrink 5000ms linear forwards'
              }} />
            </div>
          </div>
        </div>
      )}

      <main className="max-w-[1400px] mx-auto pt-28 px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* COLUMNA IZQUIERDA: FORMULARIO */}
          <section className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="mb-8">
              <h1 className="text-4xl font-black uppercase tracking-tighter italic">
                {editingId ? 'EDITAR TAREA' : 'ADMINISTRADOR DE TAREAS'}
              </h1>
              <p className="text-neon-text-dim text-[10px] uppercase tracking-neon mt-2 font-bold">
                {editingId ? 'Modifica los campos que desees' : 'Organízate a tu estilo'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-neon-card border border-neon-border p-6 rounded-lg shadow-2xl flex flex-col gap-8">
              {/* Grupo de Entradas */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-neon text-neon-text-dim font-bold ml-1 flex justify-between">
                    <span>Task Title <span className="text-red-400">*</span></span>
                    {title.length > 0 && (
                      <span className={`text-[8px] ${title.length > 100 ? 'text-red-400' : 'text-neon-text-dim'}`}>
                        {title.length}/100
                      </span>
                    )}
                  </label>
                  <input 
                    type="text"
                    placeholder="Enter short title..."
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (formErrors.title) {
                        // Limpiar error del título mientras el usuario escribe
                        setFormErrors(prev => ({ ...prev, title: undefined }));
                      }
                    }}
                    maxLength={100}
                    className={`w-full bg-neon-bg/50 border rounded-md px-4 py-3 text-sm text-gray-100 placeholder-neon-text-dim/20 focus:outline-none transition-all
                      ${formErrors.title 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-neon-border focus:border-neon-cyan/40'
                      }`}
                    disabled={isSubmitting}
                  />
                  {/*  Mostrar error debajo del input */}
                  {formErrors.title && (
                    <p className="text-red-400 text-xs mt-1 ml-1">
                    {formErrors.title}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] uppercase tracking-neon text-neon-text-dim font-bold ml-1 flex justify-between">
                    <span>Description</span>
                    {description.length > 0 && (
                      <span className={`text-[8px] ${description.length > 500 ? 'text-red-400' : 'text-neon-text-dim'}`}>
                        {description.length}/500
                      </span>
                    )}
                  </label>
                  <textarea 
                    placeholder="Technical details..."
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (formErrors.description) {
                        // Limpiar error de descripción mientras el usuario escribe
                        setFormErrors(prev => ({ ...prev, description: undefined }));
                      }
                    }}
                    rows={4}
                    maxLength={500}
                    className={`w-full bg-neon-bg/50 border rounded-md px-4 py-3 text-sm text-neon-text-dim placeholder-neon-text-dim/20 focus:outline-none transition-all resize-none
                      ${formErrors.description 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-neon-border focus:border-neon-cyan/40'
                      }`}
                    disabled={isSubmitting}
                  />
                  {/*  Mostrar error debajo del textarea */}
                  {formErrors.description && (
                    <p className="text-red-400 text-xs mt-1 ml-1">
                       {formErrors.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="pt-6 border-t border-neon-border/30 flex gap-3">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex-1 bg-neon-cyan text-neon-bg py-3.5 rounded-md font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-neon-cyan/10
                    ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white hover:scale-[1.01] active:scale-95'}
                  `}
                >
                  {isSubmitting ? 'PROCESANDO...' : (editingId ? 'ACTUALIZAR TAREA' : 'CREAR TAREA')}
                </button>
                
                {editingId && (
                  <button 
                    type="button"
                    onClick={cancelEdit}
                    disabled={isSubmitting}
                    className="px-6 bg-neon-card border border-neon-border text-neon-text-dim py-3.5 rounded-md font-black text-xs uppercase tracking-[0.2em] hover:bg-neon-border/30 transition-all"
                  >
                    CANCELAR
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* COLUMNA DERECHA: LISTA DE TAREAS CON SCROLL */}
          <section className="lg:col-span-7">
            <div className="flex justify-between items-center mb-6 border-b border-neon-border pb-4">
              <h2 className="text-neon-text-dim text-xs uppercase font-bold tracking-widest">
                LISTA DE TAREAS
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-neon-text-dim font-mono">STATUS: OK</span>
                <span className="bg-neon-card border border-neon-border px-3 py-1 rounded text-neon-cyan font-mono text-xs">
                  {todos.length.toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-20">
                <div className="inline-block w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-xs text-neon-text-dim uppercase tracking-widest font-mono">Cargando Tareas...</p>
              </div>
            ) : (
              /* CONTENEDOR CON SCROLL - Altura máxima y scroll */
              <div className="flex flex-col gap-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scroll">
                {todos.length === 0 ? (
                  <div className="border-2 border-dashed border-neon-border p-16 text-center rounded-lg">
                    <p className="text-neon-text-dim text-xs uppercase tracking-[0.4em]">No hay tareas en el sistema...</p>
                  </div>
                ) : (
                  todos.map((todo) => (
                    <TodoItem 
                      key={todo.id || `todo-${Math.random()}`} 
                      todo={todo} 
                      onToggle={toggleTodo} 
                      onDelete={deleteTodo} 
                      onEdit={handleEdit}
                    />
                  ))
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default App;