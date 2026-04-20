const { Router } = require('express');
const db = require('../db');

const router = Router();

// GET /items — list all
router.get('/', (req, res) => {
  res.json(db.getAll());
});

// GET /items/:id — get one
router.get('/:id', (req, res) => {
  const item = db.getById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// POST /items — create
router.post('/', (req, res) => {
  const { name, description } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name is required' });
  const item = db.create({ name, description: description || '' });
  res.status(201).json(item);
});

// PUT /items/:id — update
router.put('/:id', (req, res) => {
  const { name, description } = req.body || {};
  const item = db.update(req.params.id, { name, description });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// DELETE /items/:id — delete
router.delete('/:id', (req, res) => {
  const item = db.remove(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted', item });
});

module.exports = router;
