const prisma = require('../config/database');

const serializeBigInt = (obj) => JSON.parse(JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? Number(v) : v));

// POST /api/assignments
// Business logic: check task is Pending, volunteer is Approved, volunteer is available
const createAssignment = async (req, res) => {
  try {
    const { task_id } = req.body;
    const volunteer_id = req.user.userId; // Always use authenticated user's ID

    // 1. Check task exists and is Pending
    const task = await prisma.tasks.findUnique({ where: { task_id: parseInt(task_id) } });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
    if (task.status !== 'Pending') {
      return res.status(400).json({ success: false, message: `Task is already ${task.status}. Only Pending tasks can be assigned.` });
    }

    // 2. Check volunteer verification is Approved (warn but don't block for demo)
    const verification = await prisma.volunteer_Verification.findFirst({
      where: { volunteer_id: volunteer_id, background_check_status: 'Approved' }
    });
    if (!verification) {
      return res.status(400).json({
        success: false,
        message: 'Your background check is not yet approved. Please complete verification first.'
      });
    }

    // 3. Check if task already has an assignment
    const existingAssignment = await prisma.task_Assignments.findUnique({ where: { task_id: parseInt(task_id) } });
    if (existingAssignment) {
      return res.status(409).json({ success: false, message: 'Task is already assigned to another volunteer.' });
    }

    // 5. Create assignment and update task status atomically
    const [assignment] = await prisma.$transaction([
      prisma.task_Assignments.create({
        data: {
          task_id: parseInt(task_id),
          volunteer_id: parseInt(volunteer_id),
          completion_status: 'Pending'
        },
        include: {
          Tasks: { include: { Task_Categories: true, Elderly_Profiles: { select: { name: true } } } },
          Users: { select: { user_id: true, full_name: true, email: true } }
        }
      }),
      prisma.tasks.update({
        where: { task_id: parseInt(task_id) },
        data: { status: 'Assigned' }
      })
    ]);

    res.status(201).json({ success: true, message: 'Task successfully assigned to volunteer.', data: serializeBigInt(assignment) });
  } catch (error) {
    console.error('Assignment error:', error);
    res.status(500).json({ success: false, message: 'Failed to create assignment.', error: error.message });
  }
};

// PUT /api/assignments/:id/complete
const completeAssignment = async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);

    const assignment = await prisma.task_Assignments.findUnique({
      where: { assignment_id: assignmentId }
    });
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found.' });

    // Volunteer can only complete their own assignments
    if (req.user.roles.includes('Volunteer') && assignment.volunteer_id !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'You can only complete your own assignments.' });
    }

    const [updatedAssignment] = await prisma.$transaction([
      prisma.task_Assignments.update({
        where: { assignment_id: assignmentId },
        data: { completion_status: 'Completed', completed_at: new Date() }
      }),
      prisma.tasks.update({
        where: { task_id: assignment.task_id },
        data: { status: 'Completed' }
      })
    ]);

    res.json({ success: true, message: 'Assignment marked as completed.', data: serializeBigInt(updatedAssignment) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to complete assignment.', error: error.message });
  }
};

// GET /api/assignments/:id
const getAssignmentById = async (req, res) => {
  try {
    const assignmentId = parseInt(req.params.id);

    const assignment = await prisma.task_Assignments.findUnique({
      where: { assignment_id: assignmentId },
      include: {
        Tasks: {
          include: {
            Task_Categories: true,
            Elderly_Profiles: { select: { elderly_id: true, name: true } },
            Elderly_Homes: { select: { home_id: true, home_name: true } }
          }
        },
        Users: { select: { user_id: true, full_name: true, email: true, phone: true } }
      }
    });

    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found.' });

    res.json({ success: true, data: serializeBigInt(assignment) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch assignment.', error: error.message });
  }
};

// Analytics Placeholder: Volunteer Task Assignment Details
const getVolunteerTaskAssignmentDetailsRaw = async (req, res) => {
  try {
    const query = `
      SELECT 
          vol.full_name AS volunteer_name,
          t.task_date,
          t.description,
          tc.category_name,
          ep.name AS elderly_recipient,
          ta.completion_status
      FROM Task_Assignments ta
      JOIN Users vol ON ta.volunteer_id = vol.user_id
      JOIN Tasks t ON ta.task_id = t.task_id
      JOIN Task_Categories tc ON t.category_id = tc.category_id
      JOIN Elderly_Profiles ep ON t.elderly_id = ep.elderly_id
      WHERE ta.completion_status = 'Pending';
    `;
    const results = await prisma.$queryRawUnsafe(query);
    res.json({ success: true, data: serializeBigInt(results) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { createAssignment, completeAssignment, getAssignmentById, getVolunteerTaskAssignmentDetailsRaw };
