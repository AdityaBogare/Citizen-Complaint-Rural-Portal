import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { analyzeComplaint, defaultAuthorities } from './services/ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'citizen_portal_secret';
const db = new sqlite3.Database('./server/data/citizen_portal.db');

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '5mb' }));

const runSql = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });

const getSql = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Missing token' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const initDatabase = async () => {
  await runSql(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('citizen', 'officer', 'admin')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      ward TEXT,
      village TEXT,
      location TEXT,
      priority TEXT DEFAULT 'Medium',
      status TEXT DEFAULT 'Filed',
      assigned_to TEXT,
      ai_summary TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS authorities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      department TEXT NOT NULL,
      level TEXT NOT NULL,
      ward TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await runSql(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const existingUsers = await getSql('SELECT COUNT(*) as count FROM users');

  if (existingUsers[0].count === 0) {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const officerPassword = await bcrypt.hash('officer123', 10);
    const citizenPassword = await bcrypt.hash('citizen123', 10);

    await runSql(
      `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?), (?, ?, ?, ?, ?);`,
      [
        uuid(), 'System Admin', 'admin@portal.com', adminPassword, 'admin',
        uuid(), 'Ward Officer', 'officer@portal.com', officerPassword, 'officer',
        uuid(), 'Citizen User', 'citizen@portal.com', citizenPassword, 'citizen'
      ]
    );
  }

  const existingAuthorities = await getSql('SELECT COUNT(*) as count FROM authorities');
  if (existingAuthorities[0].count === 0) {
    for (const authority of defaultAuthorities) {
      await runSql(
        `INSERT INTO authorities (id, name, department, level, ward) VALUES (?, ?, ?, ?, ?);`,
        [uuid(), authority.name, authority.department, authority.level, authority.ward]
      );
    }
  }

  const existingComplaints = await getSql('SELECT COUNT(*) as count FROM complaints');
  if (existingComplaints[0].count === 0) {
    const citizen = await getSql('SELECT id FROM users WHERE email = ?', ['citizen@portal.com']);
    const officer = await getSql('SELECT id FROM users WHERE email = ?', ['officer@portal.com']);

    if (citizen[0] && officer[0]) {
      await runSql(
        `INSERT INTO complaints (id, user_id, title, description, category, ward, village, location, priority, status, assigned_to, ai_summary) VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          uuid(), citizen[0].id, 'Broken road near school', 'A deep pothole is causing accidents near the local school gate and is affecting school children.', 'Roads', 'Ward 12', 'Gokul Nagar', '17.1234, 74.7890', 'High', 'In Progress', officer[0].id, 'AI suggests road maintenance and emergency repair.',
          uuid(), citizen[0].id, 'Water leakage in public tap', 'Continuous water leakage is wasting useful water and creating stagnant puddles in the neighborhood.', 'Water Supply', 'Ward 5', 'Shivaji Colony', '17.1450, 74.8012', 'Medium', 'Filed', officer[0].id, 'AI suggests public water supply inspection.'
        ]
      );
    }
  }
};

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role = 'citizen' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email and password.' });
  }

  try {
    const existing = await getSql('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const id = uuid();
    await runSql(
      'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [id, name, email, hashed, role]
    );

    const token = jwt.sign({ id, email, role, name }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({ token, user: { id, name, email, role } });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await getSql('SELECT * FROM users WHERE email = ?', [email]);
    if (!user.length) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const matched = await bcrypt.compare(password, user[0].password);
    if (!matched) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const safeUser = {
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      role: user[0].role
    };

    const token = jwt.sign(safeUser, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

app.get('/api/dashboard/summary', authMiddleware, async (req, res) => {
  try {
    const complaints = await getSql('SELECT * FROM complaints ORDER BY created_at DESC LIMIT 10');
    const summary = {
      totalComplaints: complaints.length,
      pending: complaints.filter((item) => item.status !== 'Resolved').length,
      resolved: complaints.filter((item) => item.status === 'Resolved').length,
      escalated: complaints.filter((item) => item.status === 'Escalated').length
    };

    return res.json({ summary, complaints });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load summary', error: error.message });
  }
});

app.get('/api/complaints', authMiddleware, async (req, res) => {
  try {
    const complaints = await getSql('SELECT * FROM complaints ORDER BY created_at DESC');
    return res.json({ complaints });
  } catch (error) {
    return res.status(500).json({ message: 'Could not fetch complaints', error: error.message });
  }
});

app.post('/api/complaints', authMiddleware, async (req, res) => {
  const { title, description, category, ward, village, location, priority = 'Medium' } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ message: 'Title, description and category are required.' });
  }

  try {
    const analysis = analyzeComplaint(title, description, category);
    const complaintId = uuid();

    await runSql(
      `INSERT INTO complaints (id, user_id, title, description, category, ward, village, location, priority, status, assigned_to, ai_summary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Filed', ?, ?);`,
      [
        complaintId,
        req.user.id,
        title,
        description,
        category,
        ward || 'Ward 1',
        village || 'Local village',
        location || 'Unknown location',
        priority,
        analysis.assignedOfficer,
        JSON.stringify({
          confidence: analysis.confidence,
          department: analysis.department,
          urgency: analysis.urgency,
          suggestedAction: analysis.suggestedAction
        })
      ]
    );

    await runSql(
      `INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, ?);`,
      [uuid(), req.user.id, `Complaint filed successfully: ${title}`, 'success']
    );

    return res.status(201).json({ message: 'Complaint filed successfully', analysis });
  } catch (error) {
    return res.status(500).json({ message: 'Complaint submission failed', error: error.message });
  }
});

app.get('/api/authorities', authMiddleware, async (req, res) => {
  try {
    const authorities = await getSql('SELECT * FROM authorities ORDER BY department, level');
    return res.json({ authorities });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch authorities', error: error.message });
  }
});

app.post('/api/ai/analyze', authMiddleware, async (req, res) => {
  const { title, description, category } = req.body;
  const result = analyzeComplaint(title, description, category);
  return res.json(result);
});

app.listen(PORT, async () => {
  await initDatabase();
  console.log(`Server running on http://localhost:${PORT}`);
});
