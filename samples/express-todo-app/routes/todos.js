// routes/todos.js
const express = require('express');
const router = express.Router();
const { getAllTodos, getTodoById, createTodo } = require('../services/todoService');
const { authenticateToken } = require('../middleware/auth');

// Public route: list all
router.get('/', async (req, res) => {
  try {
    const list = await getAllTodos();
    res.json({ data: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public route: get by id
router.get('/:id', async (req, res) => {
  try {
    const item = await getTodoById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json({ data: item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected route: create todo
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title } = req.body;
    const created = await createTodo(title);
    res.status(201).json({ data: created });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
