# Task Manager API

The Express API uses PostgreSQL to persist tasks. The server creates the `tasks` table automatically at startup; the equivalent SQL is also available in `db/schema.sql`.

## Configure PostgreSQL

Set `DATABASE_URL` before starting the API. For example:

```bash
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/task_manager
```

On Windows PowerShell:

```powershell
$env:DATABASE_URL = "postgres://postgres:postgres@localhost:5432/task_manager"
```

Then install dependencies and start the API:

```bash
npm install
npm run server
```

For automatic restarts during development:

```bash
npm run server:dev
```

The API is available at `http://localhost:3001` by default. Set `PORT` to use another port.

## Database schema

The `tasks` table contains:

- `id` — UUID primary key
- `title` — required string up to 200 characters
- `description` — text with an empty-string default
- `completed` — boolean with a `false` default
- `created_at` — timestamp set by PostgreSQL when the task is created

All values supplied by API requests are passed to PostgreSQL as parameterized query values (`$1`, `$2`, etc.).

## Endpoints

### `GET /tasks`

Returns all tasks, newest first.

### `POST /tasks`

Creates a task. `title` is required:

```json
{
  "title": "Prepare release notes",
  "description": "Summarize the completed work."
}
```

Returns `201 Created` with the new task in the `data` property.

### `PUT /tasks/:id`

Replaces the editable task fields. Send `title`, `description`, and `completed`.

### `DELETE /tasks/:id`

Deletes a task and returns the deleted task in the `data` property.

Validation and not-found errors use this format:

```json
{
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "Task was not found."
  }
}
```
