const { Router } = require('express');
const { client, connect } = require('../redis');

const router = Router();

router.use(async (req, res, next) => {
  await connect();
  next();
});

// POST /cache — store a key/value
router.post('/', async (req, res) => {
  const { key, value, ttl } = req.body;
  if (!key || value === undefined) return res.status(400).json({ error: 'key and value are required' });
  const options = ttl ? { EX: ttl } : {};
  await client.set(key, JSON.stringify(value), options);
  res.status(201).json({ message: 'Stored', key, value, ttl: ttl || null });
});

// GET /cache/:key — read a value
router.get('/:key', async (req, res) => {
  const data = await client.get(req.params.key);
  if (data === null) return res.status(404).json({ error: 'Key not found' });
  res.json({ key: req.params.key, value: JSON.parse(data) });
});

// PUT /cache/:key — edit a value
router.put('/:key', async (req, res) => {
  const { value, ttl } = req.body;
  if (value === undefined) return res.status(400).json({ error: 'value is required' });
  const exists = await client.exists(req.params.key);
  if (!exists) return res.status(404).json({ error: 'Key not found' });
  const options = ttl ? { EX: ttl } : {};
  await client.set(req.params.key, JSON.stringify(value), options);
  res.json({ message: 'Updated', key: req.params.key, value, ttl: ttl || null });
});

// DELETE /cache/:key — delete a key
router.delete('/:key', async (req, res) => {
  const deleted = await client.del(req.params.key);
  if (!deleted) return res.status(404).json({ error: 'Key not found' });
  res.json({ message: 'Deleted', key: req.params.key });
});

// GET /cache — list all keys (optional ?pattern=)
router.get('/', async (req, res) => {
  const keys = await client.keys(req.query.pattern || '*');
  res.json({ keys });
});

module.exports = router;
