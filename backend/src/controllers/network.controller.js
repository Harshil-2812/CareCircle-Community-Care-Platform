const prisma = require('../config/database');

const serializeBigInt = (obj) => JSON.parse(JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? Number(v) : v));

// GET /api/networks
const getNetworks = async (req, res) => {
  try {
    const networks = await prisma.home_Networks.findMany({
      include: {
        Locations: { include: { Postal_Codes: true } },
        Home_Network_Map: { include: { Elderly_Homes: { select: { home_id: true, home_name: true, status: true } } } }
      }
    });
    res.json({ success: true, data: serializeBigInt(networks) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch networks.', error: error.message });
  }
};

// POST /api/networks (Admin)
const createNetwork = async (req, res) => {
  try {
    const { network_name, description, location_id } = req.body;
    if (!network_name) return res.status(400).json({ success: false, message: 'network_name is required.' });

    const network = await prisma.home_Networks.create({
      data: {
        network_name,
        description: description || null,
        location_id: location_id ? parseInt(location_id) : null
      }
    });
    res.status(201).json({ success: true, message: 'Network created.', data: serializeBigInt(network) });
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ success: false, message: 'Network name already exists.' });
    res.status(500).json({ success: false, message: 'Failed to create network.', error: error.message });
  }
};

// POST /api/networks/:id/homes
const addHomeToNetwork = async (req, res) => {
  try {
    const networkId = parseInt(req.params.id);
    const { home_id } = req.body;
    if (!home_id) return res.status(400).json({ success: false, message: 'home_id is required.' });

    const map = await prisma.home_Network_Map.create({
      data: { home_id: parseInt(home_id), network_id: networkId }
    });
    res.status(201).json({ success: true, message: 'Home added to network.', data: serializeBigInt(map) });
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ success: false, message: 'Home already in this network.' });
    res.status(500).json({ success: false, message: 'Failed to add home to network.', error: error.message });
  }
};

// GET /api/networks/:id/homes
const getNetworkHomes = async (req, res) => {
  try {
    const networkId = parseInt(req.params.id);
    const maps = await prisma.home_Network_Map.findMany({
      where: { network_id: networkId },
      include: {
        Elderly_Homes: { include: { Locations: { include: { Postal_Codes: true } } } }
      }
    });
    res.json({ success: true, data: serializeBigInt(maps.map(m => m.Elderly_Homes)) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch network homes.', error: error.message });
  }
};

// Analytics Placeholder: Network to Resident Mapping
const getNetworkResidentMappingRaw = async (req, res) => {
  try {
    const query = `
      SELECT 
          hn.network_name,
          eh.home_name,
          ep.name AS resident_name,
          ehr.admission_date
      FROM Home_Networks hn
      JOIN Home_Network_Map hnm ON hn.network_id = hnm.network_id
      JOIN Elderly_Homes eh ON hnm.home_id = eh.home_id
      JOIN Elderly_Home_Residents ehr ON eh.home_id = ehr.home_id
      JOIN Elderly_Profiles ep ON ehr.elderly_id = ep.elderly_id
      WHERE ehr.discharge_date IS NULL;
    `;
    const results = await prisma.$queryRawUnsafe(query);
    res.json({ success: true, data: serializeBigInt(results) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getNetworks, createNetwork, addHomeToNetwork, getNetworkHomes, getNetworkResidentMappingRaw };
