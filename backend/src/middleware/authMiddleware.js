const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided. Authorization denied.' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.users.findUnique({
      where: { user_id: decoded.userId },
      include: {
        User_Roles: {
          include: { Roles: true }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    if (user.status === 'Blocked' || user.status === 'Inactive') {
      return res.status(403).json({ success: false, message: 'Account is blocked or inactive.' });
    }

    req.user = {
      userId: user.user_id,
      email: user.email,
      fullName: user.full_name,
      roles: user.User_Roles.map(ur => ur.Roles.role_name),
      status: user.status
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
    }
    return res.status(500).json({ success: false, message: 'Server error during authentication.' });
  }
};

module.exports = authMiddleware;
