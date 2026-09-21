import cors from 'cors';
import express from 'express';
import { randomUUID } from 'node:crypto';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let tasks = [
  {
    id: randomUUID(),
    title: 'Review project brief',
    description: 'Check the project requirements and note any blockers.',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const sendError = (res, status, code, message) => {
  res.status(status).json({
    error: {
      code,
      message,
    },
  });
};

const validateTask = (body) => {
  const { title, description = '', completed = false } = body ?? {};

  if (typeof title !== 'string' || !title.trim()) {
    return 'Title is required and must be a non-empty string.';
  }

  if (title.trim().length > 200) {
    return 'Title must be 200 characters or fewer.';
  }

  if (typeof description !== 'string') {
    return 'Description must be a string.';
  }

  if (typeof completed !== 'boolean') {
    return 'Completed must be a boolean.';
  }

  return null;
};

app.get('/tasks', (_req, res) => {
  res.status(200).json({ data: tasks });
});

app.post('/tasks', (req, res) => {
  const validationError = validateTask(req.body);

  if (validationError) {
    return sendError(res, 400, 'VALIDATION_ERROR', validationError);
  }

  const now = new Date().toISOString();
  const task = {
    id: randomUUID(),
    title: req.body.title.trim(),
    description: req.body.description?.trim() ?? '',
    completed: req.body.completed ?? false,
    createdAt: now,
    updatedAt: now,
  };

  tasks = [task, ...tasks];
  return res.status(201).json({ data: task });
});

app.put('/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex((task) => task.id === req.params.id);

  if (taskIndex === -1) {
    return sendError(res, 404, 'TASK_NOT_FOUND', 'Task was not found.');
  }

  const validationError = validateTask(req.body);

  if (validationError) {
    return sendError(res, 400, 'VALIDATION_ERROR', validationError);
  }

  const updatedTask = {
    ...tasks[taskIndex],
    title: req.body.title.trim(),
    description: req.body.description.trim(),
    completed: req.body.completed,
    updatedAt: new Date().toISOString(),
  };

  tasks[taskIndex] = updatedTask;
  return res.status(200).json({ data: updatedTask });
});

app.delete('/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex((task) => task.id === req.params.id);

  if (taskIndex === -1) {
    return sendError(res, 404, 'TASK_NOT_FOUND', 'Task was not found.');
  }

  const [deletedTask] = tasks.splice(taskIndex, 1);
  return res.status(200).json({
    data: deletedTask,
    message: 'Task deleted successfully.',
  });
});

app.use((_req, res) => {
  sendError(res, 404, 'ROUTE_NOT_FOUND', 'The requested endpoint does not exist.');
});

app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return sendError(res, 400, 'INVALID_JSON', 'Request body contains invalid JSON.');
  }

  console.error(error);
  return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'An unexpected server error occurred.');
});

app.listen(port, () => {
  console.log(`Task API listening on http://localhost:${port}`);
});
