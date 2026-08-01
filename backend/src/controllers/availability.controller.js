const prisma = require('../config/database');

const serializeBigInt = (obj) => JSON.parse(JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? Number(v) : v));

// GET /api/availability/mine
const getMyAvailability = async (req, res) => {
  try {
    const slots = await prisma.availability_Slots.findMany({
      where: { volunteer_id: req.user.userId },
      orderBy: [{ available_date: 'asc' }, { start_time: 'asc' }]
    });
    res.json({ success: true, data: serializeBigInt(slots) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch availability.', error: error.message });
  }
};

// POST /api/availability
const addAvailability = async (req, res) => {
  try {
    const { available_date, start_time, end_time } = req.body;
    if (!available_date || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'available_date, start_time, and end_time are required.' });
    }

    const startDT = new Date(`1970-01-01T${start_time}`);
    const endDT = new Date(`1970-01-01T${end_time}`);
    if (endDT <= startDT) {
      return res.status(400).json({ success: false, message: 'end_time must be after start_time.' });
    }

    const slot = await prisma.availability_Slots.create({
      data: {
        volunteer_id: req.user.userId,
        available_date: new Date(available_date),
        start_time: startDT,
        end_time: endDT
      }
    });

    res.status(201).json({ success: true, message: 'Availability slot added.', data: serializeBigInt(slot) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add availability.', error: error.message });
  }
};

// DELETE /api/availability/:id
const deleteAvailability = async (req, res) => {
  try {
    const slotId = parseInt(req.params.id);

    const slot = await prisma.availability_Slots.findUnique({ where: { slot_id: slotId } });
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found.' });

    // Only the slot owner or admin can delete
    if (slot.volunteer_id !== req.user.userId && !req.user.roles.includes('Admin')) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await prisma.availability_Slots.delete({ where: { slot_id: slotId } });
    res.json({ success: true, message: 'Availability slot deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete slot.', error: error.message });
  }
};

// GET /api/availability/volunteer/:id
const getVolunteerAvailability = async (req, res) => {
  try {
    const volunteerId = parseInt(req.params.id);
    const slots = await prisma.availability_Slots.findMany({
      where: { volunteer_id: volunteerId },
      orderBy: [{ available_date: 'asc' }, { start_time: 'asc' }]
    });
    res.json({ success: true, data: serializeBigInt(slots) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch volunteer availability.', error: error.message });
  }
};

module.exports = { getMyAvailability, addAvailability, deleteAvailability, getVolunteerAvailability };
