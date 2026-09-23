import cors from 'cors';
import express from 'express';
import { randomUUID } from 'node:crypto';
import pg from 'pg';

const { Pool } = pg;
const app = express();
const port = process.env.PORT || 3001;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

app.use(cors());
app.use(express.json());

const sendError = (res, status, code, message) => {
  res.status(status).json({ error: { code, message } });
};

const mapTask = (task) => ({
  id: task.id,
  title: task.title,
  description: task.description,
  completed: task.completed,
  createdAt: task.created_at,
});

const validateTask = (body) => {
  const { title, description = '', completed = false } = body ?? {};
  if (typeof title !== 'string' || !title.trim()) return 'Title is required and must be a non-empty string.';
  if (title.trim().length > 200) return 'Title must be 200 characters or fewer.';
  if (typeof description !== 'string') return 'Description must be a string.';
  if (typeof completed !== 'boolean') return 'Completed must be a boolean.';
  return null;
};

const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/health/db', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(503).json({ status: 'error', database: ' unavailable' });
  }
});

app.get('/tasks', async (_req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, title, description, completed, created_at FROM tasks ORDER BY created_at DESC'
    );
    res.status(200).json({ data: result.rows.map(mapTask) });
  } catch (error) {
    next(error);
  }
});

app.post('/tasks', async (req, res, next) => {
  const validationError = validateTask(req.body);
  if (validationError) return sendError(res, 400, 'VALIDATION_ERROR', validationError);

  try {
    const result = await pool.query(
      `INSERT INTO tasks (id, title, description, completed)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, description, completed, created_at`,
      [randomUUID(), req.body.title.trim(), req.body.description.trim(), req.body.completed ?? false]
    );
    return res.status(201).json({ data: mapTask(result.rows[0]) });
  } catch (error) {
    return next(error);
  }
});

app.put('/tasks/:id', async (req, res, next) => {
  if (!isUuid(req.params.id)) return sendError(res, 404, 'TASK_NOT_FOUND', 'Task was not found.');
  const validationError = validateTask(req.body);
  if (validationError) return sendError(res, 400, 'VALIDATION_ERROR', validationError);

  try {
    const result = await pool.query(
      `UPDATE tasks SET title = $1, description = $2, completed = $3
       WHERE id = $4 RETURNING id, title, description, completed, created_at`,
      [req.body.title.trim(), req.body.description.trim(), req.body.completed, req.params.id]
    );
    if (result.rowCount === 0) return sendError(res, 404, 'TASK_NOT_FOUND', 'Task was not found.');
    return res.status(200).json({ data: mapTask(result.rows[0]) });
  } catch (error) {
    return next(error);
  }
});

app.delete('/tasks/:id', async (req, res, next) => {
  if (!isUuid(req.params.id)) return sendError(res, 404, 'TASK_NOT_FOUND', 'Task was not found.');

  try {
    const result = await pool.query(
      `DELETE FROM tasks WHERE id = $1
       RETURNING id, title, description, completed, created_at`,
      [req.params.id]
    );
    if (result.rowCount === 0) return sendError(res, 404, 'TASK_NOT_FOUND', 'Task was not found.');
    return res.status(200).json({ data: mapTask(result.rows[0]), message: 'Task deleted successfully.' });
  } catch (error) {
    return next(error);
  }
});

app.use((_req, res) => sendError(res, 404, 'ROUTE_NOT_FOUND', 'The requested endpoint does not exist.'));
app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return sendError(res, 400, 'INVALID_JSON', 'Request body contains invalid JSON.');
  }
  console.error(error);
  return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'An unexpected server error occurred.');
});

const start = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  app.listen(port, () => console.log(`Task API listening on http://localhost:${port}`));
};

start().catch((error) => {
  console.error('Unable to start the Task API:', error);
  process.exit(1);
});
