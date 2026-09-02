import express from 'express';
import cors from 'cors';

import { NODE_ENV, SERVER_PORT } from './config.js';
import { requireAuth } from './middleware/requireAuth.js';
import authRouter from './routes/auth.js';
import todosRouter from './routes/todos.js';

const EXPO_WEB_DEV_SERVER = 'http://localhost:8081';

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: EXPO_WEB_DEV_SERVER, // TODO: Replace with real URL in production.,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    // maxAge TODO: set a max age so isn't the browsers really quick default.
  })
);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'You made a get request.' });
});

// ROUTERS
// The prefix lives here, so the route files only
// know their own paths ("/", "/:id").
app.use('/todos', requireAuth, todosRouter);
app.use('/', authRouter);

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (NODE_ENV === 'development') {
  app.listen(SERVER_PORT, () => {
    console.log(`Server running on port ${SERVER_PORT}`);
  });
}

export default app;
