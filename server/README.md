# Task Manager API

The Express API runs separately from the Vite frontend and currently stores tasks in memory. Restarting the server resets the sample data.

## Run the API

```bash
npm install
npm run server
```

For automatic restarts during development:

```bash
npm run server:dev
```

The API is available at `http://localhost:3001` by default. Set `PORT` to use another port.

## Endpoints

### `GET /tasks`

Returns all tasks:

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Review project brief",
      "description": "Check the project requirements and note any blockers.",
      "completed": false,
      "createdAt": "2026-09-18T00:00:00.000Z",
      "updatedAt": "2026-09-18T00:00:00.000Z"
    }
  ]
}
```

### `POST /tasks`

Creates a task. `title` is required.

```json
{
  "title": "Prepare release notes",
  "description": "Summarize the completed work."
}
```

Returns `201 Created` with the new task in the `data` property.

### `PUT /tasks/:id`

Replaces the editable task fields. Send `title`, `description`, and `completed`.

```json
{
  "title": "Prepare release notes",
  "description": "Summarize the completed work and share it.",
  "completed": true
}
```

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
