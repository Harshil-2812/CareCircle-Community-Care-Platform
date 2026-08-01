const prisma = require('../config/database');

const serializeBigInt = (obj) => JSON.parse(JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? Number(v) : v));

// POST /api/family-map
const addFamilyMap = async (req, res) => {
  try {
    const { elderly_id, relation_type } = req.body;
    if (!elderly_id) return res.status(400).json({ success: false, message: 'elderly_id is required.' });

    const elderly = await prisma.elderly_Profiles.findUnique({ where: { elderly_id: parseInt(elderly_id) } });
    if (!elderly) return res.status(404).json({ success: false, message: 'Elderly profile not found.' });

    const map = await prisma.family_Elderly_Map.create({
      data: {
        family_user_id: req.user.userId,
        elderly_id: parseInt(elderly_id),
        relation_type: relation_type || null
      },
      include: { Elderly_Profiles: { select: { elderly_id: true, name: true } } }
    });

    res.status(201).json({ success: true, message: 'Elderly linked to your account.', data: serializeBigInt(map) });
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ success: false, message: 'Elderly already linked to your account.' });
    res.status(500).json({ success: false, message: 'Failed to create family map.', error: error.message });
  }
};

// GET /api/family-map/my-elderly
const getMyElderly = async (req, res) => {
  try {
    const maps = await prisma.family_Elderly_Map.findMany({
      where: { family_user_id: req.user.userId },
      include: {
        Elderly_Profiles: {
          include: { Locations: { include: { Postal_Codes: true } } }
        }
      }
    });

    const data = maps.map(m => ({
      map_id: m.map_id,
      relation_type: m.relation_type,
      elderly: {
        ...m.Elderly_Profiles,
        age: m.Elderly_Profiles.date_of_birth
          ? Math.floor((new Date() - new Date(m.Elderly_Profiles.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000))
          : null
      }
    }));

    res.json({ success: true, data: serializeBigInt(data) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch your elderly.', error: error.message });
  }
};

// DELETE /api/family-map/:map_id
const removeFamilyMap = async (req, res) => {
  try {
    const mapId = parseInt(req.params.map_id);

    const map = await prisma.family_Elderly_Map.findUnique({ where: { map_id: mapId } });
    if (!map) return res.status(404).json({ success: false, message: 'Family map not found.' });

    if (map.family_user_id !== req.user.userId && !req.user.roles.includes('Admin')) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await prisma.family_Elderly_Map.delete({ where: { map_id: mapId } });
    res.json({ success: true, message: 'Elderly unlinked from your account.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove family map.', error: error.message });
  }
};

// Analytics Placeholder: Comprehensive Family Dashboard Mapping
const getFamilyDashboardMappingRaw = async (req, res) => {
  try {
    const query = `
      SELECT 
          u.full_name AS family_member_name,
          ep.name AS elderly_name, 
          ep.date_of_birth, 
          fem.relation_type,
          loc.city
      FROM Users u
      INNER JOIN Family_Elderly_Map fem ON u.user_id = fem.family_user_id
      INNER JOIN Elderly_Profiles ep ON fem.elderly_id = ep.elderly_id
      LEFT JOIN Locations loc ON ep.location_id = loc.location_id
      WHERE u.email = ?;
    `;
    const results = await prisma.$queryRawUnsafe(query, req.user?.email || 'admin@carecircle.com');
    res.json({ success: true, data: serializeBigInt(results) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { addFamilyMap, getMyElderly, removeFamilyMap, getFamilyDashboardMappingRaw };
