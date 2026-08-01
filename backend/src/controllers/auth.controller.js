const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { full_name, email, phone, password, role } = req.body;

    const existingUser = await prisma.users.findFirst({
      where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] }
    });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email or phone already registered.' });
    }

    const roleRecord = await prisma.roles.findUnique({ where: { role_name: role } });
    if (!roleRecord) {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        full_name,
        email,
        phone: phone || null,
        password_hash,
        User_Roles: { create: { role_id: roleRecord.role_id } }
      },
      include: { User_Roles: { include: { Roles: true } } }
    });

    const token = generateToken(user.user_id);

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: {
        token,
        user: {
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          roles: user.User_Roles.map(ur => ur.Roles.role_name)
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed.', error: error.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.users.findUnique({
      where: { email },
      include: { User_Roles: { include: { Roles: true } } }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (user.status === 'Blocked') {
      return res.status(403).json({ success: false, message: 'Your account has been blocked. Contact support.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generateToken(user.user_id);

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          status: user.status,
          roles: user.User_Roles.map(ur => ur.Roles.role_name)
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed.', error: error.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { user_id: req.user.userId },
      include: { User_Roles: { include: { Roles: true } } }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      data: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        status: user.status,
        created_at: user.created_at,
        roles: user.User_Roles.map(ur => ur.Roles.role_name)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user.', error: error.message });
  }
};

module.exports = { register, login, getMe };
