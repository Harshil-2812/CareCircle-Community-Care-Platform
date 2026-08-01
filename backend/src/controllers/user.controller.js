const prisma = require('../config/database');

// Helper: convert BigInt values from raw SQL to plain numbers
const serializeBigInt = (data) =>
  JSON.parse(JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? Number(v) : v)));

// GET /api/users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {
      ...(status && { status }),
      ...(role && {
        User_Roles: { some: { Roles: { role_name: role } } }
      })
    };

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where: whereClause,
        skip,
        take: parseInt(limit),
        include: { User_Roles: { include: { Roles: true } } },
        orderBy: { created_at: 'desc' }
      }),
      prisma.users.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      data: users.map(u => ({
        user_id: u.user_id,
        full_name: u.full_name,
        email: u.email,
        phone: u.phone,
        status: u.status,
        created_at: u.created_at,
        roles: u.User_Roles.map(ur => ur.Roles.role_name)
      })),
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users.', error: error.message });
  }
};

// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    // Non-admins can only view their own profile
    if (!req.user.roles.includes('Admin') && req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      include: { User_Roles: { include: { Roles: true } } }
    });

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

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

// PUT /api/users/:id/status (Admin only)
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Active', 'Inactive', 'Blocked'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be Active, Inactive, or Blocked.' });
    }

    const user = await prisma.users.update({
      where: { user_id: parseInt(id) },
      data: { status }
    });

    res.json({ success: true, message: `User status updated to ${status}.`, data: { user_id: user.user_id, status: user.status } });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(500).json({ success: false, message: 'Failed to update user status.', error: error.message });
  }
};

// GET /api/roles
const getRoles = async (req, res) => {
  try {
    const roles = await prisma.roles.findMany({ orderBy: { role_id: 'asc' } });
    res.json({ success: true, data: roles });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch roles.', error: error.message });
  }
};

// Analytics Placeholder: Top Volunteer Leaderboard
const getTopVolunteerLeaderboardRaw = async (req, res) => {
  try {
    const query = `
      SELECT 
          u.full_name AS volunteer_name,
          COUNT(ta.assignment_id) AS completed_tasks
      FROM Users u
      JOIN Task_Assignments ta ON u.user_id = ta.volunteer_id
      WHERE ta.completion_status = 'Completed'
      GROUP BY u.user_id, u.full_name
      ORDER BY completed_tasks DESC
      LIMIT 10;
    `;
    const results = await prisma.$queryRawUnsafe(query);
    res.json({ success: true, data: serializeBigInt(results) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getAllUsers, getUserById, updateUserStatus, getRoles, getTopVolunteerLeaderboardRaw };
