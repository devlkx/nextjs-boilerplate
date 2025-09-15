"use client";

import { useEffect, useMemo, useState } from "react";
import type React from "react";

type TodoItem = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
};

type FilterType = "all" | "active" | "completed";

const STORAGE_KEY = "todo_app_items_v1";

function generateTodoId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export default function Home() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as TodoItem[];
        setTodos(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      setTodos([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      // ignore persistence errors
    }
  }, [todos]);

  const filteredTodos = useMemo(() => {
    if (filter === "active") return todos.filter((t: TodoItem) => !t.completed);
    if (filter === "completed") return todos.filter((t: TodoItem) => t.completed);
    return todos;
  }, [todos, filter]);

  const remainingCount = useMemo(
    () => todos.filter((t: TodoItem) => !t.completed).length,
    [todos]
  );

  function handleAddTodo() {
    const text = newTodoText.trim();
    if (!text) return;
    const now = Date.now();
    const todo: TodoItem = {
      id: generateTodoId(),
      text,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };
    setTodos((prev: TodoItem[]) => [todo, ...prev]);
    setNewTodoText("");
  }

  function handleToggleTodo(id: string) {
    setTodos((prev: TodoItem[]) =>
      prev.map((t: TodoItem) =>
        t.id === id
          ? { ...t, completed: !t.completed, updatedAt: Date.now() }
          : t
      )
    );
  }

  function handleDeleteTodo(id: string) {
    setTodos((prev: TodoItem[]) => prev.filter((t: TodoItem) => t.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditingText("");
    }
  }

  function startEditTodo(id: string, currentText: string) {
    setEditingId(id);
    setEditingText(currentText);
  }

  function cancelEditTodo() {
    setEditingId(null);
    setEditingText("");
  }

  function saveEditTodo() {
    if (!editingId) return;
    const text = editingText.trim();
    if (!text) return;
    setTodos((prev: TodoItem[]) =>
      prev.map((t: TodoItem) => (t.id === editingId ? { ...t, text, updatedAt: Date.now() } : t))
    );
    setEditingId(null);
    setEditingText("");
  }

  function clearCompleted() {
    setTodos((prev: TodoItem[]) => prev.filter((t: TodoItem) => !t.completed));
  }

  return (
    <div className="min-h-screen p-6 sm:p-10 flex flex-col items-center">
      <main className="w-full max-w-2xl flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Todo</h1>

        <div className="flex gap-2">
          <input
            aria-label="Add todo"
            className="flex-1 rounded-md border border-black/10 dark:border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder="What needs to be done?"
            value={newTodoText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTodoText(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") handleAddTodo();
            }}
          />
          <button
            className="rounded-md border border-transparent bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
            onClick={handleAddTodo}
            disabled={!newTodoText.trim()}
          >
            Add
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-foreground/70">
            {remainingCount} item{remainingCount === 1 ? "" : "s"} left
          </div>
          <div className="inline-flex rounded-md border border-black/10 dark:border-white/15 overflow-hidden">
            {(["all", "active", "completed"] as FilterType[]).map((key: FilterType) => (
              <button
                key={key}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === key
                    ? "bg-foreground text-background"
                    : "hover:bg-black/5 dark:hover:bg-white/10"
                }`}
                onClick={() => setFilter(key)}
              >
                {key[0].toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
          <button
            className="self-start sm:self-auto text-sm text-red-600 dark:text-red-400 hover:underline disabled:opacity-40"
            onClick={clearCompleted}
            disabled={!todos.some((t: TodoItem) => t.completed)}
          >
            Clear completed
          </button>
        </div>

        <ul className="flex flex-col divide-y divide-black/10 dark:divide-white/10 rounded-md border border-black/10 dark:border-white/15 overflow-hidden bg-transparent">
          {filteredTodos.length === 0 ? (
            <li className="p-4 text-sm text-foreground/60">No todos</li>
          ) : (
            filteredTodos.map((todo: TodoItem) => (
              <li key={todo.id} className="group flex items-center gap-3 p-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-foreground"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo.id)}
                  aria-label={todo.completed ? "Mark as active" : "Mark as completed"}
                />

                {editingId === todo.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      autoFocus
                      className="flex-1 rounded-md border border-black/10 dark:border-white/15 bg-transparent px-2 py-1 outline-none focus:ring-2 focus:ring-foreground/20"
                      value={editingText}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingText(e.target.value)}
                      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter") saveEditTodo();
                        if (e.key === "Escape") cancelEditTodo();
                      }}
                    />
                    <button
                      className="rounded-md border border-transparent bg-foreground text-background px-3 py-1 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                      onClick={saveEditTodo}
                      disabled={!editingText.trim()}
                    >
                      Save
                    </button>
                    <button
                      className="rounded-md border border-black/10 dark:border-white/15 px-3 py-1 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                      onClick={cancelEditTodo}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-between gap-2">
                    <span
                      className={`truncate ${
                        todo.completed ? "line-through text-foreground/50" : ""
                      }`}
                    >
                      {todo.text}
                    </span>
                    <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button
                        className="rounded-md border border-black/10 dark:border-white/15 px-2 py-1 text-xs hover:bg-black/5 dark:hover:bg-white/10"
                        onClick={() => startEditTodo(todo.id, todo.text)}
                      >
                        Edit
                      </button>
                      <button
                        className="rounded-md border border-red-300 text-red-600 dark:text-red-400 px-2 py-1 text-xs hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={() => handleDeleteTodo(todo.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </main>
    </div>
  );
}
