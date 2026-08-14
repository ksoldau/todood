
import dotenv from 'dotenv'
import express from 'express';
import { Client as PGClient } from 'pg';

// Set these env variables in package.json commands
const SERVER_PORT = process.env.PORT;
const POSTGRES_HOST = process.env.POSTGRES_HOST;
const POSTGRES_PORT = process.env.POSTGRES_PORT;
const NODE_ENV = process.env.NODE_ENV

// TODO: Could add some helpful errors if missing any process.envs here

if (NODE_ENV === 'development') {
    console.log('Loading .env config')
    dotenv.config({ path: '.env.local' })
}

// These env variables are from the .env file specified in package.json
const POSTGRES_USER = process.env.POSTGRES_USER
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD

const app = express();
const pgClient = new PGClient({
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    host: POSTGRES_HOST, 
    port: POSTGRES_PORT, 
    database: 'todood',
})

// GET 
app.get('/', (req, res) => {
  res.json({ message: 'You made a get request.' });
})

// Get all of a user's todo items
app.get('/todos', async (req, res) => {
    const userId = req.query['user-id'];
    const result = await pgClient.query('SELECT * FROM todos WHERE user_id = $1', [userId]);
    res.json(result.rows);
});

(async () => {
    try {
        await pgClient.connect();
        console.log('Connected to DB')
        // RUN SERVER
        app.listen(SERVER_PORT, () => {
            console.log(`Server running on port ${SERVER_PORT}`);
        })
    } catch (error) {
        console.error('Startup error:', error);
        process.exit(1);
    }
})();

