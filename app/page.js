
"use client";

import { useCallback, useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/tasks";

async function apiRequest(url, options = {}) {
  const response = await fetch(url, options);

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Something went wrong.");
  }

  return result;
}

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyTasks, setBusyTasks] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const result = await apiRequest(API_URL);

      if (!Array.isArray(result.tasks)) {
        throw new Error("The server response must contain a tasks array.");
      }

      setTasks(result.tasks);
    } catch (error) {
      setLoadError(error.message || "Could not load tasks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setMessage("");

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle) {
      setFormError("Please enter a task title.");
      return;
    }

    setSaving(true);

    try {
      const result = await apiRequest(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: cleanTitle,
          description: cleanDescription,
        }),
      });

      setTasks((current) => [result.task, ...current]);
      setTitle("");
      setDescription("");
      setMessage("Your task has been created!");
    } catch (error) {
      setFormError(error.message || "Could not create the task.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task) {
    setFormError("");
    setMessage("");

    setBusyTasks((current) => [...current, task._id]);

    try {
      const result = await apiRequest(`${API_URL}/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      setTasks((current) =>
        current.map((item) =>
          item._id === task._id ? result.task : item
        )
      );

      setMessage("Task status updated.");
    } catch (error) {
      setFormError(error.message || "Could not update the task.");
    } finally {
      setBusyTasks((current) =>
        current.filter((id) => id !== task._id)
      );
    }
  }

  async function deleteTask(taskId) {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    setFormError("");
    setMessage("");

    setBusyTasks((current) => [...current, taskId]);

    try {
      await apiRequest(`${API_URL}/${taskId}`, {
        method: "DELETE",
      });

      setTasks((current) =>
        current.filter((task) => task._id !== taskId)
      );

      setMessage("Task deleted successfully.");
    } catch (error) {
      setFormError(error.message || "Could not delete the task.");
    } finally {
      setBusyTasks((current) =>
        current.filter((id) => id !== taskId)
      );
    }
  }

  const completedCount = tasks.filter((task) => task.completed).length;
  const pendingCount = tasks.length - completedCount;
  const progress =
    tasks.length === 0
      ? 0
      : Math.round((completedCount / tasks.length) * 100);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
              YOUR PRODUCTIVITY SPACE
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              My Task Manager
            </h1>
            <p className="mt-3 max-w-xl text-slate-600">
              A little progress every day adds up to big results.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-5 py-3">
            <p className="text-sm font-medium text-blue-700">Your progress</p>
            <p className="mt-1 text-2xl font-extrabold text-blue-900">
              {progress}%
            </p>
          </div>
        </header>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total tasks" value={tasks.length} icon="📋" />
          <StatCard label="Pending" value={pendingCount} icon="⏳" />
          <StatCard label="Completed" value={completedCount} icon="✅" />
        </section>

        <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5">
            <h2 className="text-xl font-bold">Create a new task</h2>
            <p className="mt-1 text-sm text-slate-500">
              Add what you need to get done.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-semibold">
                Task title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Finish my project"
                maxLength={200}
                required
                disabled={saving}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold"
              >
                Description <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add any helpful details..."
                rows={3}
                disabled={saving}
                className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {saving ? "Adding task..." : "+ Add task"}
            </button>

            {formError && (
              <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {formError}
              </p>
            )}
            {message && (
              <p role="status" className="rounded-xl bg-green-50 p-3 text-sm text-green-700">
                {message}
              </p>
            )}
          </form>
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold">Your tasks</h2>
              <p className="mt-1 text-sm text-slate-500">
                Keep your next step in sight.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchTasks}
              disabled={loading}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-slate-100 disabled:opacity-50"
            >
              {loading ? "Loading..." : "↻ Refresh"}
            </button>
          </div>

          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
              Loading your tasks...
            </div>
          )}

          {!loading && loadError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
              <h3 className="font-bold text-red-800">Couldn't load your tasks</h3>
              <p className="mt-2 text-sm text-red-700">{loadError}</p>
              <button
                type="button"
                onClick={fetchTasks}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !loadError && tasks.length === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <div className="text-4xl" aria-hidden="true">📝</div>
              <h3 className="mt-4 text-lg font-bold">A fresh start!</h3>
              <p className="mt-2 text-slate-500">
                No tasks yet. Add your first task using the form above.
              </p>
            </div>
          )}

          {!loading && !loadError && tasks.length > 0 && (
            <div className="space-y-4">
              {tasks.map((task) => {
                const isBusy = busyTasks.includes(task._id);

                return (
                  <article
                    key={task._id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md sm:p-6"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h3
                            className={`break-words text-lg font-bold ${
                              task.completed
                                ? "text-slate-400 line-through"
                                : "text-slate-900"
                            }`}
                          >
                            {task.title}
                          </h3>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              task.completed
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {task.completed ? "Completed" : "Pending"}
                          </span>
                        </div>

                        <p className="break-words text-sm leading-6 text-slate-600">
                          {task.description || "No description added."}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => toggleTask(task)}
                          disabled={isBusy}
                          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isBusy
                            ? "Please wait..."
                            : task.completed
                              ? "Mark pending"
                              : "✓ Complete"}
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteTask(task._id)}
                          disabled={isBusy}
                          className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="mt-10 border-t border-slate-200 py-6 text-center text-sm text-slate-500">
          Built one task at a time. Keep going! ✨
        </footer>
      </div>
    </main>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <span className="text-xl" aria-hidden="true">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-extrabold tracking-tight">{value}</p>
    </div>
  );
}
