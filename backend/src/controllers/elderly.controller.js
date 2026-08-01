const prisma = require('../config/database');

// Helper: Build elderly select with computed age via raw SQL
const elderlyWithAge = `
  SELECT e.elderly_id, e.name, e.date_of_birth, e.gender, e.living_type, e.location_id,
         TIMESTAMPDIFF(YEAR, e.date_of_birth, CURDATE()) AS age,
         l.address_line, l.pincode, pc.city, pc.state
  FROM Elderly_Profiles e
  LEFT JOIN Locations l ON e.location_id = l.location_id
  LEFT JOIN Postal_Codes pc ON l.pincode = pc.pincode
`;

// GET /api/elderly
const getAllElderly = async (req, res) => {
  try {
    let elderly;
    if (req.user.roles.includes('Admin')) {
      elderly = await prisma.$queryRaw`
        SELECT e.elderly_id, e.name, e.date_of_birth, e.gender, e.living_type, e.location_id,
               TIMESTAMPDIFF(YEAR, e.date_of_birth, CURDATE()) AS age,
               l.address_line, l.pincode, pc.city, pc.state
        FROM Elderly_Profiles e
        LEFT JOIN Locations l ON e.location_id = l.location_id
        LEFT JOIN Postal_Codes pc ON l.pincode = pc.pincode
        ORDER BY e.elderly_id
      `;
    } else if (req.user.roles.includes('Family')) {
      elderly = await prisma.$queryRaw`
        SELECT e.elderly_id, e.name, e.date_of_birth, e.gender, e.living_type, e.location_id,
               TIMESTAMPDIFF(YEAR, e.date_of_birth, CURDATE()) AS age,
               l.address_line, l.pincode, pc.city, pc.state,
               fem.relation_type
        FROM Elderly_Profiles e
        JOIN Family_Elderly_Map fem ON e.elderly_id = fem.elderly_id
        LEFT JOIN Locations l ON e.location_id = l.location_id
        LEFT JOIN Postal_Codes pc ON l.pincode = pc.pincode
        WHERE fem.family_user_id = ${req.user.userId}
        ORDER BY e.elderly_id
      `;
    } else {
      // Volunteers can see all elderly (for task browsing)
      elderly = await prisma.$queryRaw`
        SELECT e.elderly_id, e.name, e.date_of_birth, e.gender, e.living_type, e.location_id,
               TIMESTAMPDIFF(YEAR, e.date_of_birth, CURDATE()) AS age,
               l.address_line, l.pincode, pc.city, pc.state
        FROM Elderly_Profiles e
        LEFT JOIN Locations l ON e.location_id = l.location_id
        LEFT JOIN Postal_Codes pc ON l.pincode = pc.pincode
        ORDER BY e.elderly_id
      `;
    }

    // Convert BigInt to Number for JSON serialization
    const data = elderly.map(e => ({ ...e, age: Number(e.age), elderly_id: Number(e.elderly_id), location_id: e.location_id ? Number(e.location_id) : null }));

    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch elderly profiles.', error: error.message });
  }
};

// POST /api/elderly
const createElderly = async (req, res) => {
  try {
    const { name, date_of_birth, gender, living_type, location_id, relation_type } = req.body;

    if (!name || !date_of_birth) {
      return res.status(400).json({ success: false, message: 'name and date_of_birth are required.' });
    }

    const elderly = await prisma.elderly_Profiles.create({
      data: {
        name,
        date_of_birth: new Date(date_of_birth),
        gender: gender || 'Male',
        living_type: living_type || 'Home',
        location_id: location_id ? parseInt(location_id) : null
      }
    });

    // Auto-link family user
    if (req.user.roles.includes('Family') && relation_type) {
      await prisma.family_Elderly_Map.create({
        data: {
          family_user_id: req.user.userId,
          elderly_id: elderly.elderly_id,
          relation_type
        }
      });
    }

    res.status(201).json({ success: true, message: 'Elderly profile created.', data: elderly });
  } catch (error) {
    console.error('createElderly error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create elderly profile.' });
  }
};

// GET /api/elderly/:id
const getElderlyById = async (req, res) => {
  try {
    const elderlyId = parseInt(req.params.id);

    // Check access for family users
    if (req.user.roles.includes('Family')) {
      const map = await prisma.family_Elderly_Map.findFirst({
        where: { family_user_id: req.user.userId, elderly_id: elderlyId }
      });
      if (!map) return res.status(403).json({ success: false, message: 'Access denied to this elderly profile.' });
    }

    const [elderly] = await prisma.$queryRaw`
      SELECT e.elderly_id, e.name, e.date_of_birth, e.gender, e.living_type, e.location_id,
             TIMESTAMPDIFF(YEAR, e.date_of_birth, CURDATE()) AS age,
             l.address_line, l.pincode, pc.city, pc.state
      FROM Elderly_Profiles e
      LEFT JOIN Locations l ON e.location_id = l.location_id
      LEFT JOIN Postal_Codes pc ON l.pincode = pc.pincode
      WHERE e.elderly_id = ${elderlyId}
    `;

    if (!elderly) return res.status(404).json({ success: false, message: 'Elderly profile not found.' });

    const notes = await prisma.elderly_Medical_Notes.findMany({ where: { elderly_id: elderlyId }, orderBy: { noted_at: 'desc' } });
    const contacts = await prisma.emergency_Contacts.findMany({ where: { elderly_id: elderlyId } });

    res.json({
      success: true,
      data: {
        ...elderly,
        age: Number(elderly.age),
        elderly_id: Number(elderly.elderly_id),
        location_id: elderly.location_id ? Number(elderly.location_id) : null,
        medical_notes: notes,
        emergency_contacts: contacts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch elderly profile.', error: error.message });
  }
};

// PUT /api/elderly/:id
const updateElderly = async (req, res) => {
  try {
    const elderlyId = parseInt(req.params.id);
    const { name, date_of_birth, gender, living_type, location_id } = req.body;

    if (req.user.roles.includes('Family')) {
      const map = await prisma.family_Elderly_Map.findFirst({
        where: { family_user_id: req.user.userId, elderly_id: elderlyId }
      });
      if (!map) return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const updated = await prisma.elderly_Profiles.update({
      where: { elderly_id: elderlyId },
      data: {
        ...(name && { name }),
        ...(date_of_birth && { date_of_birth: new Date(date_of_birth) }),
        ...(gender && { gender }),
        ...(living_type && { living_type }),
        ...(location_id !== undefined && { location_id: location_id || null })
      }
    });

    res.json({ success: true, message: 'Elderly profile updated.', data: updated });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Elderly profile not found.' });
    res.status(500).json({ success: false, message: 'Failed to update elderly profile.', error: error.message });
  }
};

// DELETE /api/elderly/:id (Admin only)
const deleteElderly = async (req, res) => {
  try {
    const elderlyId = parseInt(req.params.id);
    await prisma.elderly_Profiles.delete({ where: { elderly_id: elderlyId } });
    res.json({ success: true, message: 'Elderly profile deleted.' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Elderly profile not found.' });
    res.status(500).json({ success: false, message: 'Failed to delete elderly profile.', error: error.message });
  }
};

// GET /api/elderly/:id/notes
const getNotes = async (req, res) => {
  try {
    const elderlyId = parseInt(req.params.id);
    const notes = await prisma.elderly_Medical_Notes.findMany({
      where: { elderly_id: elderlyId },
      orderBy: { noted_at: 'desc' }
    });
    res.json({ success: true, data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notes.', error: error.message });
  }
};

// POST /api/elderly/:id/notes
const addNote = async (req, res) => {
  try {
    const elderlyId = parseInt(req.params.id);
    const { condition_note } = req.body;

    if (!condition_note) return res.status(400).json({ success: false, message: 'condition_note is required.' });

    const note = await prisma.elderly_Medical_Notes.create({
      data: { elderly_id: elderlyId, condition_note }
    });

    res.status(201).json({ success: true, message: 'Medical note added.', data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add note.', error: error.message });
  }
};

// DELETE /api/elderly/:id/notes/:noteId
const deleteNote = async (req, res) => {
  try {
    const noteId = parseInt(req.params.noteId);
    await prisma.elderly_Medical_Notes.delete({ where: { note_id: noteId } });
    res.json({ success: true, message: 'Medical note deleted.' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Note not found.' });
    res.status(500).json({ success: false, message: 'Failed to delete note.', error: error.message });
  }
};

// GET /api/elderly/:id/contacts
const getContacts = async (req, res) => {
  try {
    const elderlyId = parseInt(req.params.id);
    const contacts = await prisma.emergency_Contacts.findMany({ where: { elderly_id: elderlyId } });
    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch contacts.', error: error.message });
  }
};

// POST /api/elderly/:id/contacts
const addContact = async (req, res) => {
  try {
    const elderlyId = parseInt(req.params.id);
    const { contact_name, contact_phone, relation } = req.body;

    if (!contact_name || !contact_phone) return res.status(400).json({ success: false, message: 'contact_name and contact_phone are required.' });

    const contact = await prisma.emergency_Contacts.create({
      data: { elderly_id: elderlyId, contact_name, contact_phone, relation }
    });

    res.status(201).json({ success: true, message: 'Emergency contact added.', data: contact });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add contact.', error: error.message });
  }
};

// DELETE /api/elderly/:id/contacts/:contactId
const deleteContact = async (req, res) => {
  try {
    const contactId = parseInt(req.params.contactId);
    await prisma.emergency_Contacts.delete({ where: { contact_id: contactId } });
    res.json({ success: true, message: 'Emergency contact deleted.' });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Contact not found.' });
    res.status(500).json({ success: false, message: 'Failed to delete contact.', error: error.message });
  }
};

// GET /api/elderly/:id/residence
const getResidence = async (req, res) => {
  try {
    const elderlyId = parseInt(req.params.id);
    const residents = await prisma.elderly_Home_Residents.findMany({
      where: { elderly_id: elderlyId },
      include: { Elderly_Homes: { include: { Locations: { include: { Postal_Codes: true } } } } },
      orderBy: { admission_date: 'desc' }
    });
    res.json({ success: true, data: residents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch residence history.', error: error.message });
  }
};

module.exports = { getAllElderly, createElderly, getElderlyById, updateElderly, deleteElderly, getNotes, addNote, deleteNote, getContacts, addContact, deleteContact, getResidence };
