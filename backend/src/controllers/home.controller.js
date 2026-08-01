const prisma = require('../config/database');

const serializeBigInt = (obj) => JSON.parse(JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? Number(v) : v));

// GET /api/homes
const getHomes = async (req, res) => {
  try {
    const homes = await prisma.elderly_Homes.findMany({
      include: { Locations: { include: { Postal_Codes: true } } },
      orderBy: { home_id: 'asc' }
    });
    res.json({ success: true, data: serializeBigInt(homes) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch homes.', error: error.message });
  }
};

// POST /api/homes (Admin)
const createHome = async (req, res) => {
  try {
    const { home_name, registration_number, capacity, phone, email, location_id, status } = req.body;
    if (!home_name || !capacity) return res.status(400).json({ success: false, message: 'home_name and capacity are required.' });

    const home = await prisma.elderly_Homes.create({
      data: {
        home_name,
        registration_number: registration_number || null,
        capacity: parseInt(capacity),
        phone: phone || null,
        email: email || null,
        location_id: location_id ? parseInt(location_id) : null,
        status: status || 'Active'
      }
    });
    res.status(201).json({ success: true, message: 'Elderly home created.', data: serializeBigInt(home) });
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ success: false, message: 'Registration number already exists.' });
    res.status(500).json({ success: false, message: 'Failed to create home.', error: error.message });
  }
};

// GET /api/homes/:id
const getHomeById = async (req, res) => {
  try {
    const homeId = parseInt(req.params.id);
    const home = await prisma.elderly_Homes.findUnique({
      where: { home_id: homeId },
      include: {
        Locations: { include: { Postal_Codes: true } },
        Home_Network_Map: { include: { Home_Networks: true } }
      }
    });
    if (!home) return res.status(404).json({ success: false, message: 'Home not found.' });
    res.json({ success: true, data: serializeBigInt(home) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch home.', error: error.message });
  }
};

// PUT /api/homes/:id (Admin)
const updateHome = async (req, res) => {
  try {
    const homeId = parseInt(req.params.id);
    const { home_name, registration_number, capacity, phone, email, location_id, status } = req.body;

    const home = await prisma.elderly_Homes.update({
      where: { home_id: homeId },
      data: {
        ...(home_name && { home_name }),
        ...(registration_number !== undefined && { registration_number }),
        ...(capacity && { capacity: parseInt(capacity) }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(location_id !== undefined && { location_id: location_id ? parseInt(location_id) : null }),
        ...(status && { status })
      }
    });
    res.json({ success: true, message: 'Home updated.', data: serializeBigInt(home) });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Home not found.' });
    res.status(500).json({ success: false, message: 'Failed to update home.', error: error.message });
  }
};

// GET /api/homes/:id/residents
const getResidents = async (req, res) => {
  try {
    const homeId = parseInt(req.params.id);
    const { active_only } = req.query;

    const whereClause = {
      home_id: homeId,
      ...(active_only === 'true' && { discharge_date: null })
    };

    const residents = await prisma.elderly_Home_Residents.findMany({
      where: whereClause,
      include: {
        Elderly_Profiles: {
          select: {
            elderly_id: true, name: true, date_of_birth: true, gender: true
          }
        }
      },
      orderBy: { admission_date: 'desc' }
    });

    // Compute age via JS since we can't use raw SQL easily here
    const data = residents.map(r => ({
      ...r,
      elderly: {
        ...r.Elderly_Profiles,
        age: r.Elderly_Profiles.date_of_birth
          ? Math.floor((new Date() - new Date(r.Elderly_Profiles.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000))
          : null
      }
    }));

    res.json({ success: true, data: serializeBigInt(data) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch residents.', error: error.message });
  }
};

// POST /api/homes/:id/residents
const addResident = async (req, res) => {
  try {
    const homeId = parseInt(req.params.id);
    const { elderly_id, room_number, admission_date } = req.body;
    if (!elderly_id || !admission_date) return res.status(400).json({ success: false, message: 'elderly_id and admission_date are required.' });

    const resident = await prisma.elderly_Home_Residents.create({
      data: {
        elderly_id: parseInt(elderly_id),
        home_id: homeId,
        room_number: room_number || null,
        admission_date: new Date(admission_date)
      }
    });
    res.status(201).json({ success: true, message: 'Resident admitted.', data: serializeBigInt(resident) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add resident.', error: error.message });
  }
};

// PUT /api/homes/:id/residents/:resident_id/discharge
const dischargeResident = async (req, res) => {
  try {
    const residentId = parseInt(req.params.resident_id);
    const { discharge_date } = req.body;
    const date = discharge_date ? new Date(discharge_date) : new Date();

    const resident = await prisma.elderly_Home_Residents.update({
      where: { resident_id: residentId },
      data: { discharge_date: date }
    });
    res.json({ success: true, message: 'Resident discharged.', data: serializeBigInt(resident) });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Resident record not found.' });
    res.status(500).json({ success: false, message: 'Failed to discharge resident.', error: error.message });
  }
};

// Analytics Placeholder: Care Home Occupancy Report
const getCareHomeOccupancyReportRaw = async (req, res) => {
  try {
    const query = `
      SELECT 
          h.home_name, 
          COUNT(r.resident_id) AS current_residents,
          h.capacity,
          (h.capacity - COUNT(r.resident_id)) AS available_beds
      FROM Elderly_Homes h
      LEFT JOIN Elderly_Home_Residents r ON h.home_id = r.home_id AND r.discharge_date IS NULL
      GROUP BY h.home_id, h.home_name, h.capacity
      HAVING current_residents > 0
      ORDER BY available_beds ASC;
    `;
    const results = await prisma.$queryRawUnsafe(query);
    res.json({ success: true, data: serializeBigInt(results) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getHomes, createHome, getHomeById, updateHome, getResidents, addResident, dischargeResident, getCareHomeOccupancyReportRaw };
