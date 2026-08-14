import express from 'express';

const app = express();

const PORT = 3000; // for local development

// GET 
app.get('/', (req, res) => {
  res.json({ message: 'You made a get request.' });
});

// RUN SERVER
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
