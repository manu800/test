const { createClient } = require('redis');

const url = process.env.REDIS_URL || 'redis://localhost:6379';

const client = createClient({
  url,
  socket: url.startsWith('rediss://') ? { tls: true, rejectUnauthorized: false } : {},
});

client.on('error', (err) => console.error('Redis error:', err));

async function connect() {
  if (!client.isOpen) await client.connect();
}

module.exports = { client, connect };
