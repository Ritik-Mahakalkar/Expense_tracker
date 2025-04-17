const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
const port = 4000;
app.use(cors());
app.use(bodyParser.json());


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456789',
  database: 'expenses_tracker'
});

db.connect((err) => {
  if (err) {
    console.error(' MySQL Connection Error:', err);
    process.exit(1);
  }
  console.log(' MySQL Connected');
});


app.post('/users', (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  const sql = `INSERT INTO users (name) VALUES (?)`;
  db.query(sql, [name], (err, result) => {
    if (err) {
      console.error('Insert Error:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    res.status(201).json({ message: 'User added', user_id: result.insertId });
  });
});


app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.status(200).json(results);
  });
});


app.post('/expenses', (req, res) => {
  const { user_id, title, amount, category, expense_date } = req.body;

  if (!user_id || !title || !amount || !category || !expense_date) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  db.query(`SELECT * FROM users WHERE id = ?`, [user_id], (err, userResults) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (userResults.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const sql = `INSERT INTO expenses (user_id, title, amount, category, expense_date) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [user_id, title, amount, category, expense_date], (err, result) => {
      if (err) {
        console.error('Insert Error:', err);
        return res.status(500).json({ message: 'Failed to add expense' });
      }
      res.status(201).json({ message: 'Expense added', expense_id: result.insertId });
    });
  });
});


app.get('/expenses/:user_id', (req, res) => {
  const { user_id } = req.params;

  db.query(`SELECT * FROM users WHERE id = ?`, [user_id], (err, userResults) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (userResults.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const sql = `SELECT * FROM expenses WHERE user_id = ? ORDER BY expense_date DESC`;
    db.query(sql, [user_id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed to fetch expenses' });
      res.status(200).json(results);
    });
  });
});


app.delete('/expenses/:id', (req, res) => {
  const { id } = req.params;

  db.query(`DELETE FROM expenses WHERE id = ?`, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to delete expense' });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(200).json({ message: 'Expense deleted' });
  });
});


app.get('/expenses/summary/:user_id', (req, res) => {
  const { user_id } = req.params;

  db.query(`SELECT * FROM users WHERE id = ?`, [user_id], (err, userResults) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (userResults.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const sql = `SELECT category, SUM(amount) AS total FROM expenses WHERE user_id = ? GROUP BY category`;
    db.query(sql, [user_id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Failed to fetch summary' });
      res.status(200).json(results);
    });
  });
});

app.listen(port, () => {
  console.log(` Server running on http://localhost:${port}`);
});
