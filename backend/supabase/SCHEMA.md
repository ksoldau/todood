# Database Schema

## Overview

Two tables: `users` (accounts) and `todos` (tasks). Each todo belongs to one user.

## Users Table

Stores user account information.

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Columns

| Column          | Type         | Required? | Notes                                                       |
| --------------- | ------------ | --------- | ----------------------------------------------------------- |
| `id`            | SERIAL       | Yes       | Primary key. Unique identifier for each user.               |
| `email`         | VARCHAR(255) | Yes       | Email address. Must be unique (only one account per email). |
| `password_hash` | TEXT         | Yes       | Hashed password (never store plain text).                   |
| `created_at`    | TIMESTAMP    | Yes       | When the account was created. Auto-set to now.              |
| `updated_at`    | TIMESTAMP    | Yes       | When the account was last modified. Auto-set to now.        |

## Todos Table

Stores todo items. Each todo is owned by one user.

```sql
CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  notes TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Columns

| Column         | Type         | Required? | Notes                                                    |
| -------------- | ------------ | --------- | -------------------------------------------------------- |
| `id`           | SERIAL       | Yes       | Primary key. Unique identifier for each todo.            |
| `user_id`      | INTEGER      | Yes       | Foreign key to `users.id`. Links this todo to its owner. |
| `title`        | VARCHAR(255) | Yes       | Todo description.                                        |
| `notes`        | TEXT         | No        | Additional details about the todo.                       |
| `completed_at` | TIMESTAMP    | No        | When the todo was completed. NULL if not completed yet.  |
| `created_at`   | TIMESTAMP    | Yes       | When the todo was created. Auto-set to now.              |
| `updated_at`   | TIMESTAMP    | Yes       | When the todo was last modified. Auto-set to now.        |

## Relationships

- **One-to-many**: One user can have many todos.
- **Foreign key constraint**: `todos.user_id` references `users.id`. If a user is deleted, their todos should be handled (cascade delete or prevent deletion).

## Notes

- `completed_at` is NULL when a todo is not completed, has a timestamp when completed. This captures both the state (done/not done) and the timing.
- No cascade delete set up yet — deleting a user won't automatically delete their todos. Can be added later if needed.
