const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const s3 = require('../s3');

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /storage/upload — upload a file
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file is required' });
  const ext = path.extname(req.file.originalname);
  const key = `uploads/${Date.now()}-${req.file.originalname}`;
  await s3.upload(key, req.file.buffer, req.file.mimetype);
  res.status(201).json({ key });
});

// GET /storage/files — list files (optional ?prefix=)
router.get('/files', async (req, res) => {
  const files = await s3.listFiles(req.query.prefix || '');
  res.json(files);
});

// GET /storage/files/:key — get presigned download URL (key passed as query param for slashes)
router.get('/files', async (req, res, next) => {
  if (!req.query.key) return next();
  const url = await s3.getPresignedUrl(req.query.key);
  res.json({ url });
});

// DELETE /storage/files?key= — delete a file
router.delete('/files', async (req, res) => {
  const key = req.query.key;
  if (!key) return res.status(400).json({ error: 'key query param is required' });
  await s3.deleteFile(key);
  res.json({ message: 'Deleted', key });
});

module.exports = router;
