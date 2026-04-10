// Todoitem.tsx - Versión corregida
import React, { useMemo } from 'react';
import { 
  TrashIcon, 
  PencilSquareIcon, 
  CheckCircleIcon, 
  ArrowPathIcon,
  CalendarDaysIcon,
  ArrowPathRoundedSquareIcon
} from '@heroicons/react/24/outline';
import type { Todo } from '../types/Todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string | number) => void;  
  onDelete: (id: string | number) => void;   
  onEdit: (todo: Todo) => void;              
  isEditing?: boolean;                    
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete, onEdit, isEditing }) => {
  
  // Validar que todo existe
  if (!todo || !todo.id) {
    console.error('TodoItem recibió un todo inválido:', todo);
    return null;
  }
  
  // Computado: Truncar descripción
  const truncatedDescription = useMemo(() => {
    if (!todo.description) return "";
    return todo.description.length > 40 
      ? todo.description.substring(0, 40) + "..." 
      : todo.description;
  }, [todo.description]);

  // Computado: Formatear fechas
  const formattedDates = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    };
    return {
      created: todo.created_at ? new Date(todo.created_at).toLocaleDateString('es-ES', options) : 'N/A',
      updated: todo.updated_at ? new Date(todo.updated_at).toLocaleDateString('es-ES', options) : 'N/A'
    };
  }, [todo.created_at, todo.updated_at]);

  // Asegurar que id sea string para toString()
  const todoId = String(todo.id);
  const displayId = todoId.slice(-4).toUpperCase();

  return (
    <div className={`
      group flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg border transition-all duration-200
      ${todo.completed 
        ? 'bg-neon-card/40 border-neon-border opacity-70' 
        : 'bg-neon-card border-neon-border hover:border-neon-cyan/50 shadow-lg'}
      ${isEditing ? 'border-neon-cyan ring-1 ring-neon-cyan/50' : ''}
    `}>
      
      {/* SECCIÓN DE IDENTIFICACIÓN E INFO */}
      <div className="grow flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono bg-neon-bg px-2 py-0.5 rounded text-neon-cyan border border-neon-cyan/20">
            ID-{displayId}
          </span>
          <h3 className={`text-sm font-bold tracking-tight ${todo.completed ? 'line-through text-neon-text-dim' : 'text-gray-100'}`}>
            {todo.title || 'Sin título'}
          </h3>
        </div>
        
        <p className="text-xs text-neon-text-dim font-light italic">
          {truncatedDescription || 'Sin descripción'}
        </p>

        {/* METADATOS: FECHAS */}
        <div className="flex gap-4 text-[9px] font-mono text-neon-text-dim/60 uppercase tracking-tighter">
          <div className="flex items-center gap-1">
            <CalendarDaysIcon className="w-3 h-3" />
            <span>Created: {formattedDates.created}</span>
          </div>
          <div className="flex items-center gap-1">
            <ArrowPathRoundedSquareIcon className="w-3 h-3" />
            <span>Updated: {formattedDates.updated}</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE ACCIONES */}
      <div className="flex items-center gap-2 mt-2 md:mt-0">
        <button
          onClick={() => onToggle(todo.id)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-all
            ${todo.completed 
              ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20' 
              : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500/20'}
          `}
        >
          {todo.completed ? (
            <><CheckCircleIcon className="w-3.5 h-3.5" /> COMPLETADA</>
          ) : (
            <><ArrowPathIcon className="w-3.5 h-3.5" /> PENDIENTE</>
          )}
        </button>

        <button
          onClick={() => onEdit(todo)}
          className="p-2 bg-neon-bg border border-neon-border text-neon-text-dim hover:text-neon-cyan hover:border-neon-cyan transition-all rounded"
          title="Update Task"
        >
          <PencilSquareIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDelete(todo.id)}
          className="p-2 bg-neon-bg border border-neon-border text-neon-text-dim hover:text-red-500 hover:border-red-500 transition-all rounded"
          title="Delete Task"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};