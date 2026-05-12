const express = require('express');
const sqlite3 = require('better-sqlite3');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production-please';
const DB_PATH    = process.env.DB_PATH    || '/data/ets2.db';

// ── ensure data dir ──────────────────────────────────────────────────────────
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

// ── DB setup ─────────────────────────────────────────────────────────────────
const db = sqlite3(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT    UNIQUE NOT NULL,
    password    TEXT    NOT NULL,
    created_at  TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS fahrten (
    id          TEXT    PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    data        TEXT    NOT NULL,
    updated_at  TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS trucks (
    id          TEXT    PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    data        TEXT    NOT NULL,
    updated_at  TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS fahrer (
    id          TEXT    PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    data        TEXT    NOT NULL,
    updated_at  TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS garagen (
    id          TEXT    PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    data        TEXT    NOT NULL,
    updated_at  TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS roads (
    user_id     INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    data        TEXT    NOT NULL DEFAULT '{}',
    updated_at  TEXT    DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS explore (
    user_id     INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    data        TEXT    NOT NULL DEFAULT '{}',
    updated_at  TEXT    DEFAULT (datetime('now'))
  );
`);

// ── middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'No token' });
  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ── AUTH routes ───────────────────────────────────────────────────────────────
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password too short (min 6)' });
  const hash = bcrypt.hashSync(password, 10);
  try {
    const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    const info = stmt.run(username.trim().toLowerCase(), hash);
    const token = jwt.sign({ id: info.lastInsertRowid, username }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, username });
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(409).json({ error: 'Username taken' });
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username?.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, username: user.username });
});

app.get('/api/me', auth, (req, res) => {
  res.json({ id: req.user.id, username: req.user.username });
});

app.post('/api/change-password', auth, (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'New password too short' });
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(oldPassword, user.password)) return res.status(401).json({ error: 'Wrong current password' });
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(bcrypt.hashSync(newPassword, 10), req.user.id);
  res.json({ ok: true });
});

// ── GENERIC CRUD helper ───────────────────────────────────────────────────────
function crudRoutes(table) {
  // GET all
  app.get(`/api/${table}`, auth, (req, res) => {
    const rows = db.prepare(`SELECT id, data FROM ${table} WHERE user_id = ?`).all(req.user.id);
    res.json(rows.map(r => ({ ...JSON.parse(r.data), id: r.id })));
  });

  // PUT upsert single item
  app.put(`/api/${table}/:id`, auth, (req, res) => {
    const { id } = req.params;
    const data = JSON.stringify({ ...req.body, id });
    db.prepare(`INSERT INTO ${table} (id, user_id, data, updated_at)
                VALUES (?, ?, ?, datetime('now'))
                ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
                WHERE user_id = ?`).run(id, req.user.id, data, req.user.id);
    res.json({ ok: true });
  });

  // DELETE single item
  app.delete(`/api/${table}/:id`, auth, (req, res) => {
    db.prepare(`DELETE FROM ${table} WHERE id = ? AND user_id = ?`).run(req.params.id, req.user.id);
    res.json({ ok: true });
  });

  // BULK replace (full sync)
  app.post(`/api/${table}/sync`, auth, (req, res) => {
    const items = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Array expected' });
    const del  = db.prepare(`DELETE FROM ${table} WHERE user_id = ?`);
    const ins  = db.prepare(`INSERT INTO ${table} (id, user_id, data, updated_at) VALUES (?, ?, ?, datetime('now'))`);
    db.transaction(() => {
      del.run(req.user.id);
      items.forEach(item => ins.run(item.id, req.user.id, JSON.stringify(item)));
    })();
    res.json({ ok: true, count: items.length });
  });
}

crudRoutes('fahrten');
crudRoutes('trucks');
crudRoutes('fahrer');
crudRoutes('garagen');

// ── KV routes (roads + explore) ───────────────────────────────────────────────
['roads','explore'].forEach(table => {
  app.get(`/api/${table}`, auth, (req, res) => {
    const row = db.prepare(`SELECT data FROM ${table} WHERE user_id = ?`).get(req.user.id);
    res.json(row ? JSON.parse(row.data) : {});
  });
  app.put(`/api/${table}`, auth, (req, res) => {
    const data = JSON.stringify(req.body);
    db.prepare(`INSERT INTO ${table} (user_id, data, updated_at)
                VALUES (?, ?, datetime('now'))
                ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`)
      .run(req.user.id, data);
    res.json({ ok: true });
  });
});

// ── FULL EXPORT / IMPORT ──────────────────────────────────────────────────────
app.get('/api/export', auth, (req, res) => {
  const uid = req.user.id;
  const get = (t) => db.prepare(`SELECT data FROM ${t} WHERE user_id = ?`).all(uid).map(r => JSON.parse(r.data));
  const getKV = (t) => { const r = db.prepare(`SELECT data FROM ${t} WHERE user_id = ?`).get(uid); return r ? JSON.parse(r.data) : {}; };
  res.json({
    fahrten:  get('fahrten'),
    trucks:   get('trucks'),
    fahrer:   get('fahrer'),
    garagen:  get('garagen'),
    roads:    getKV('roads'),
    explore:  getKV('explore'),
    exportedAt: new Date().toISOString(),
    username: req.user.username
  });
});

app.post('/api/import', auth, (req, res) => {
  const { fahrten=[], trucks=[], fahrer=[], garagen=[], roads={}, explore={} } = req.body;
  const uid = req.user.id;
  const sync = (table, items) => {
    db.prepare(`DELETE FROM ${table} WHERE user_id = ?`).run(uid);
    const ins = db.prepare(`INSERT INTO ${table} (id, user_id, data) VALUES (?, ?, ?)`);
    items.forEach(item => ins.run(item.id, uid, JSON.stringify(item)));
  };
  const setKV = (table, data) => {
    db.prepare(`INSERT INTO ${table} (user_id, data) VALUES (?, ?)
                ON CONFLICT(user_id) DO UPDATE SET data = excluded.data`)
      .run(uid, JSON.stringify(data));
  };
  db.transaction(() => {
    sync('fahrten', fahrten);
    sync('trucks', trucks);
    sync('fahrer', fahrer);
    sync('garagen', garagen);
    setKV('roads', roads);
    setKV('explore', explore);
  })();
  res.json({ ok: true });
});

// ── health ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.listen(PORT, () => console.log(`ETS2 API running on :${PORT}`));