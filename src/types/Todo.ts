// types/Todo.ts
export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean; // ✅ Cambiado de isCompleted a completed
  created_at: string;
  updated_at: string;
}