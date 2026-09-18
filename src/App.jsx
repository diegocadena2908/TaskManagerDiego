import { useMemo, useState } from 'react';

const initialTasks = [
  {
    id: 1,
    title: 'Review project brief',
    description: 'Check the project requirements and note any blockers.',
    completed: false,
  },
  {
    id: 2,
    title: 'Prepare sprint tasks',
    description: 'List all tasks for the upcoming sprint and assign owners.',
    completed: true,
  },
  {
    id: 3,
    title: 'Book team demo',
    description: 'Schedule a demo with stakeholders for Friday afternoon.',
    completed: false,
  },
];

function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const totalTasks = tasks.length;
  const completedTasks = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks]
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!title.trim()) return;

    const newTask = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      completed: false,
    };

    setTasks((currentTasks) => [newTask, ...currentTasks]);
    setTitle('');
    setDescription('');
  };

  const toggleTask = (taskId) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (taskId) => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/30 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
                Workspace
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Task Manager
              </h1>
            </div>

            <div className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-300">
              {completedTasks}/{totalTasks} done
            </div>
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-slate-950/20">
            <h2 className="text-xl font-semibold text-white">Add a task</h2>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="task-title" className="mb-2 block text-sm font-medium text-slate-300">
                  Title
                </label>
                <input
                  id="task-title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Finish landing page copy"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label htmlFor="task-description" className="mb-2 block text-sm font-medium text-slate-300">
                  Description
                </label>
                <textarea
                  id="task-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Write the final content and review it with the team."
                  rows="5"
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                Add Task
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-slate-950/20">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-white">Tasks</h2>
              <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                {totalTasks} total
              </span>
            </div>

            {tasks.length === 0 ? (
              <div className="flex min-h-52 items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 text-center text-slate-400">
                <div>
                  <p className="text-lg font-medium text-slate-200">No tasks yet</p>
                  <p className="mt-1 text-sm">Add a task to get started.</p>
                </div>
              </div>
            ) : (
              <ul className="space-y-3">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className={`rounded-2xl border p-4 transition ${
                      task.completed
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : 'border-slate-700 bg-slate-950/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="mt-1 h-5 w-5 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                        aria-label={`Mark ${task.title} complete`}
                      />

                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-base font-medium ${
                            task.completed ? 'text-slate-400 line-through' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </p>
                        {task.description && (
                          <p
                            className={`mt-1 text-sm ${
                              task.completed ? 'text-slate-500' : 'text-slate-300'
                            }`}
                          >
                            {task.description}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
