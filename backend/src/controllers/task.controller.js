const prisma = require('../config/database');

// Helper to serialize BigInt
const serializeBigInt = (obj) => JSON.parse(JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? Number(v) : v));

// GET /api/tasks
const getAllTasks = async (req, res) => {
  try {
    const { status, elderly_id } = req.query;

    let whereClause = {};
    if (status) whereClause.status = status;
    if (elderly_id) whereClause.elderly_id = parseInt(elderly_id);

    // Family: only tasks for their elderly
    if (req.user.roles.includes('Family') && !req.user.roles.includes('Admin')) {
      const myElderly = await prisma.family_Elderly_Map.findMany({
        where: { family_user_id: req.user.userId },
        select: { elderly_id: true }
      });
      whereClause.elderly_id = { in: myElderly.map(e => e.elderly_id) };
    }

    const tasks = await prisma.tasks.findMany({
      where: whereClause,
      include: {
        Elderly_Profiles: { select: { elderly_id: true, name: true } },
        Users: { select: { user_id: true, full_name: true } },
        Task_Categories: true,
        Elderly_Homes: { select: { home_id: true, home_name: true } },
        Task_Assignments: { include: { Users: { select: { user_id: true, full_name: true } } } }
      },
      orderBy: { task_date: 'asc' }
    });

    res.json({ success: true, data: serializeBigInt(tasks) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tasks.', error: error.message });
  }
};

// POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { elderly_id, category_id, home_id, description, task_date, task_time } = req.body;

    // Family users can only create tasks for their elderly
    if (req.user.roles.includes('Family') && !req.user.roles.includes('Admin')) {
      const map = await prisma.family_Elderly_Map.findFirst({
        where: { family_user_id: req.user.userId, elderly_id: parseInt(elderly_id) }
      });
      if (!map) return res.status(403).json({ success: false, message: 'You can only create tasks for your registered elderly.' });
    }

    const task = await prisma.tasks.create({
      data: {
        elderly_id: parseInt(elderly_id),
        requested_by: req.user.userId,
        category_id: parseInt(category_id),
        home_id: home_id ? parseInt(home_id) : null,
        description,
        task_date: new Date(task_date),
        task_time: task_time ? new Date(`1970-01-01T${task_time}`) : null,
        status: 'Pending'
      },
      include: { Task_Categories: true, Elderly_Profiles: { select: { name: true } } }
    });

    res.status(201).json({ success: true, message: 'Task created.', data: serializeBigInt(task) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create task.', error: error.message });
  }
};

// GET /api/tasks/pending
const getPendingTasks = async (req, res) => {
  try {
    const tasks = await prisma.tasks.findMany({
      where: { status: 'Pending' },
      include: {
        Elderly_Profiles: { select: { elderly_id: true, name: true, living_type: true } },
        Users: { select: { user_id: true, full_name: true } },
        Task_Categories: true,
        Elderly_Homes: { select: { home_id: true, home_name: true } }
      },
      orderBy: { task_date: 'asc' }
    });
    res.json({ success: true, data: serializeBigInt(tasks) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch pending tasks.', error: error.message });
  }
};

// GET /api/tasks/my-assignments
const getMyAssignments = async (req, res) => {
  try {
    const assignments = await prisma.task_Assignments.findMany({
      where: { volunteer_id: req.user.userId },
      include: {
        Tasks: {
          include: {
            Elderly_Profiles: { select: { elderly_id: true, name: true } },
            Task_Categories: true,
            Elderly_Homes: { select: { home_id: true, home_name: true } }
          }
        }
      },
      orderBy: { assigned_at: 'desc' }
    });
    res.json({ success: true, data: serializeBigInt(assignments) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch assignments.', error: error.message });
  }
};

// GET /api/tasks/:id
const getTaskById = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);

    const task = await prisma.tasks.findUnique({
      where: { task_id: taskId },
      include: {
        Elderly_Profiles: true,
        Users: { select: { user_id: true, full_name: true, email: true } },
        Task_Categories: true,
        Elderly_Homes: true,
        Task_Assignments: {
          include: { Users: { select: { user_id: true, full_name: true, email: true } } }
        }
      }
    });

    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    res.json({ success: true, data: serializeBigInt(task) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch task.', error: error.message });
  }
};

// PUT /api/tasks/:id/status
const updateTaskStatus = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { status } = req.body;

    if (!['Pending', 'Assigned', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const task = await prisma.tasks.update({
      where: { task_id: taskId },
      data: { status }
    });

    res.json({ success: true, message: `Task status updated to ${status}.`, data: serializeBigInt(task) });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Task not found.' });
    res.status(500).json({ success: false, message: 'Failed to update task status.', error: error.message });
  }
};

// Analytics Placeholder: Urgent Tasks Pending
const getUrgentTasksPendingRaw = async (req, res) => {
  try {
    const query = `
      SELECT task_id, description, task_date
      FROM Tasks 
      WHERE status = 'Pending' 
      AND task_date <= DATE_ADD(CURDATE(), INTERVAL 2 DAY)
      AND task_id NOT IN (
          SELECT task_id FROM Task_Assignments
      );
    `;
    const results = await prisma.$queryRawUnsafe(query);
    res.json({ success: true, data: serializeBigInt(results) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getAllTasks, createTask, getTaskById, updateTaskStatus, getPendingTasks, getMyAssignments, getUrgentTasksPendingRaw };
