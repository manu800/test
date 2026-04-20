const items = new Map();
let nextId = 1;

module.exports = {
  getAll: () => Array.from(items.values()),

  getById: (id) => items.get(Number(id)) || null,

  create: (data) => {
    const item = { id: nextId++, ...data, createdAt: new Date().toISOString() };
    items.set(item.id, item);
    return item;
  },

  update: (id, data) => {
    const existing = items.get(Number(id));
    if (!existing) return null;
    const updated = { ...existing, ...data, id: existing.id, updatedAt: new Date().toISOString() };
    items.set(updated.id, updated);
    return updated;
  },

  remove: (id) => {
    const existing = items.get(Number(id));
    if (!existing) return null;
    items.delete(Number(id));
    return existing;
  },
};
