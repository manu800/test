const { Router } = require('express');
const pool = require('../postgres');

const router = Router();

async function initTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS records (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      data JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Records table ready');
}

initTable().catch(err => console.error('Table init error:', err));

// POST /records — create
router.post('/', async (req, res) => {
  const { title, data } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  const result = await pool.query(
    'INSERT INTO records (title, data) VALUES ($1, $2) RETURNING *',
    [title, data !== undefined ? JSON.stringify(data) : null]
  );
  res.status(201).json(result.rows[0]);
});

// GET /records — list all
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM records ORDER BY created_at DESC');
  res.json(result.rows);
});

// GET /records/:id — get one
router.get('/:id', async (req, res) => {
  const result = await pool.query('SELECT * FROM records WHERE id = $1', [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
});

// PUT /records/:id — update
router.put('/:id', async (req, res) => {
  const { title, data } = req.body;
  const result = await pool.query(
    'UPDATE records SET title = COALESCE($1, title), data = COALESCE($2, data), updated_at = NOW() WHERE id = $3 RETURNING *',
    [title || null, data !== undefined ? JSON.stringify(data) : null, req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
});

// DELETE /records/:id — delete
router.delete('/:id', async (req, res) => {
  const result = await pool.query('DELETE FROM records WHERE id = $1 RETURNING *', [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted', record: result.rows[0] });
});

module.exports = router;
