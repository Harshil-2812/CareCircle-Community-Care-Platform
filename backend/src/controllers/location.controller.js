const prisma = require('../config/database');

const serializeBigInt = (obj) => JSON.parse(JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? Number(v) : v));

// GET /api/locations
const getLocations = async (req, res) => {
  try {
    const locations = await prisma.locations.findMany({
      include: { Postal_Codes: true },
      orderBy: { location_id: 'asc' }
    });
    res.json({ success: true, data: serializeBigInt(locations) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch locations.', error: error.message });
  }
};

// POST /api/locations
const createLocation = async (req, res) => {
  try {
    const { address_line, pincode } = req.body;
    if (!pincode) return res.status(400).json({ success: false, message: 'pincode is required.' });

    // Verify pincode exists
    const postal = await prisma.postal_Codes.findUnique({ where: { pincode } });
    if (!postal) return res.status(400).json({ success: false, message: 'Pincode not found. Please add postal code first.' });

    const location = await prisma.locations.create({
      data: { address_line: address_line || null, pincode },
      include: { Postal_Codes: true }
    });
    res.status(201).json({ success: true, message: 'Location created.', data: serializeBigInt(location) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create location.', error: error.message });
  }
};

// GET /api/postal-codes
const getPostalCodes = async (req, res) => {
  try {
    const { city, state } = req.query;
    const postalCodes = await prisma.postal_Codes.findMany({
      where: {
        ...(city && { city: { contains: city } }),
        ...(state && { state: { contains: state } })
      },
      orderBy: { pincode: 'asc' }
    });
    res.json({ success: true, data: postalCodes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch postal codes.', error: error.message });
  }
};

// POST /api/postal-codes
const createPostalCode = async (req, res) => {
  try {
    const { pincode, city, state } = req.body;
    if (!pincode || !city || !state) return res.status(400).json({ success: false, message: 'pincode, city, and state are required.' });

    const postal = await prisma.postal_Codes.create({ data: { pincode, city, state } });
    res.status(201).json({ success: true, message: 'Postal code created.', data: postal });
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ success: false, message: 'Pincode already exists.' });
    res.status(500).json({ success: false, message: 'Failed to create postal code.', error: error.message });
  }
};

module.exports = { getLocations, createLocation, getPostalCodes, createPostalCode };
