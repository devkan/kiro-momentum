import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Todo } from '../types';
import { StorageService } from '../services/StorageService';
import { useTheme } from '../contexts/ThemeContext';

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const { theme } = useTheme();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load todos from LocalStorage on mount
  useEffect(() => {
    const savedTodos = StorageService.getTodos();
    setTodos(savedTodos);
  }, []);

  // Persist todos to LocalStorage with debouncing (300ms)
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      try {
        StorageService.setTodos(todos);
      } catch (error) {
        console.error('Failed to save todos:', error);
      }
    }, 300);

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [todos]);

  // Add todo with whitespace validation
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate: reject empty or whitespace-only strings
    if (!inputValue.trim()) {
      return;
    }

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      createdAt: Date.now(),
      completed: false,
    };

    setTodos([...todos, newTodo]);
    setInputValue('');
  };

  // Toggle todo completion status
  const handleToggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // Delete todo
  const handleDeleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // Apply glitch animation class in Glitch Mode
  const glitchClass = theme.textGlitch ? 'glitch-text' : '';

  return (
    <div className="w-full mx-auto">
      {/* Main input field - centered and prominent */}
      <form onSubmit={handleAddTodo} className="mb-8">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="What is your focus for today?"
          className={`w-full px-6 py-4 text-center text-xl rounded-xl bg-white/10 backdrop-blur-md border-2 border-white/30 
            text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/50
            transition-all ${glitchClass}`}
          aria-label="New task input"
        />
      </form>

      {/* Todo list */}
      <ul className="space-y-3" role="list" aria-label="Todo list">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className={`flex items-center gap-4 px-5 py-4 rounded-xl 
              bg-white/10 backdrop-blur-md border border-white/20 text-white text-lg
              hover:bg-white/15 transition-all ${glitchClass}`}
          >
            {/* Checkbox */}
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggleTodo(todo.id)}
              className="w-5 h-5 rounded border-2 border-white/40 bg-white/10 
                checked:bg-white/80 checked:border-white cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
              aria-label={`Mark task as ${todo.completed ? 'incomplete' : 'complete'}: ${todo.text}`}
            />
            
            {/* Task text with strikethrough when completed */}
            <span className={`flex-1 transition-all ${todo.completed ? 'line-through opacity-60' : ''}`}>
              {todo.text}
            </span>
            
            {/* Delete button */}
            <button
              onClick={() => handleDeleteTodo(todo.id)}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors opacity-70 hover:opacity-100"
              aria-label={`Delete task: ${todo.text}`}
            >
              <Trash2 size={18} />
            </button>
          </li>
        ))}
      </ul>

      {todos.length === 0 && (
        <p className="text-center text-white/40 mt-8 text-lg italic">
          "Embrace possibility."
        </p>
      )}
    </div>
  );
}
