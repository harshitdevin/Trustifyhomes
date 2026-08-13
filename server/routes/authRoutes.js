import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ez_homes_jammu_jwt_secret_2026';

// In-memory mock DB for backend API auth
const USERS_DB = [
  {
    id: 'user-admin',
    name: 'Super Administrator',
    email: 'admin@ezhomes.in',
    passwordHash: bcrypt.hashSync('admin123', 8),
    role: 'admin',
    city: 'Jammu'
  },
  {
    id: 'user-broker',
    name: 'Col. Vikram Singh',
    email: 'vikram.singh@gandhinagar.in',
    passwordHash: bcrypt.hashSync('broker123', 8),
    role: 'broker',
    city: 'Jammu',
    reraId: 'JKRERA/JM/AGENT/2024/00889'
  },
  {
    id: 'user-customer',
    name: 'Harshit Sharma',
    email: 'harshit@ezhomes.in',
    passwordHash: bcrypt.hashSync('customer123', 8),
    role: 'customer',
    city: 'Jammu'
  }
];

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password, role, city } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  const existing = USERS_DB.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    passwordHash: bcrypt.hashSync(password, 8),
    role: role || 'customer',
    city: city || 'Jammu'
  };
  USERS_DB.push(newUser);

  const token = jwt.sign({ id: newUser.id, role: newUser.role, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id: newUser.id, name, email, role: newUser.role, city } });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = USERS_DB.find(u => u.email.toLowerCase() === email?.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, city: user.city } });
});

export default router;
