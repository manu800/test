require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/items', require('./routes/items'));
app.use('/storage', require('./routes/storage'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
