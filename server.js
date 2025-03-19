const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Create SQLite database connection
const db = new sqlite3.Database('todos.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    // Create todos table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      completed BOOLEAN DEFAULT 0
    )`);
  }
});

// Get all todos
app.get('/api/todos', (req, res) => {
  db.all('SELECT * FROM todos', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Add new todo
app.post('/api/todos', (req, res) => {
  const { text } = req.body;
  db.run('INSERT INTO todos (text) VALUES (?)', [text], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, text, completed: false });
  });
});

// Update todo
app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { text, completed } = req.body;
  db.run('UPDATE todos SET text = ?, completed = ? WHERE id = ?', 
    [text, completed, id], 
    (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, text, completed });
    });
});

// Delete todo
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM todos WHERE id = ?', [id], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 