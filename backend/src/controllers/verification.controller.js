const prisma = require('../config/database');

const serializeBigInt = (obj) => JSON.parse(JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? Number(v) : v));

// POST /api/verification
const submitVerification = async (req, res) => {
  try {
    const { id_document_type, id_proof_number } = req.body;

    // Check if volunteer already submitted
    const existing = await prisma.volunteer_Verification.findFirst({
      where: { volunteer_id: req.user.userId }
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a verification request.',
        data: serializeBigInt(existing)
      });
    }

    const verification = await prisma.volunteer_Verification.create({
      data: {
        volunteer_id: req.user.userId,
        id_document_type: id_document_type || null,
        id_proof_number: id_proof_number || null,
        background_check_status: 'Pending'
      }
    });

    res.status(201).json({ success: true, message: 'Verification request submitted.', data: serializeBigInt(verification) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit verification.', error: error.message });
  }
};

// GET /api/verification/pending (Admin)
const getPendingVerifications = async (req, res) => {
  try {
    const verifications = await prisma.volunteer_Verification.findMany({
      where: { background_check_status: 'Pending' },
      include: {
        Volunteer: { select: { user_id: true, full_name: true, email: true, phone: true, created_at: true } }
      },
      orderBy: { verification_id: 'asc' }
    });
    res.json({ success: true, data: serializeBigInt(verifications) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch pending verifications.', error: error.message });
  }
};

// PUT /api/verification/:id (Admin)
const updateVerification = async (req, res) => {
  try {
    const verificationId = parseInt(req.params.id);
    const { background_check_status } = req.body;

    if (!['Approved', 'Rejected', 'Pending'].includes(background_check_status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const verification = await prisma.volunteer_Verification.update({
      where: { verification_id: verificationId },
      data: {
        background_check_status,
        verified_by: req.user.userId,
        verified_at: new Date()
      },
      include: {
        Volunteer: { select: { user_id: true, full_name: true, email: true } }
      }
    });

    res.json({ success: true, message: `Verification ${background_check_status}.`, data: serializeBigInt(verification) });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Verification not found.' });
    res.status(500).json({ success: false, message: 'Failed to update verification.', error: error.message });
  }
};

// GET /api/verification/status (Volunteer's own status)
const getMyVerificationStatus = async (req, res) => {
  try {
    const verification = await prisma.volunteer_Verification.findFirst({
      where: { volunteer_id: req.user.userId },
      include: {
        Verifier: { select: { user_id: true, full_name: true } }
      }
    });

    if (!verification) {
      return res.json({ success: true, data: null, message: 'No verification request found. Please submit one.' });
    }

    res.json({ success: true, data: serializeBigInt(verification) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch verification status.', error: error.message });
  }
};

// Analytics Placeholder: Admin Verification Log
const getAdminVerificationLogRaw = async (req, res) => {
  try {
    const query = `
      SELECT 
          vol.full_name AS volunteer_target,
          v.id_document_type,
          v.background_check_status,
          admin.full_name AS verified_by_admin,
          v.verified_at
      FROM Volunteer_Verification v
      JOIN Users vol ON v.volunteer_id = vol.user_id
      INNER JOIN Users admin ON v.verified_by = admin.user_id
      WHERE v.background_check_status = 'Approved';
    `;
    const results = await prisma.$queryRawUnsafe(query);
    res.json({ success: true, data: serializeBigInt(results) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { submitVerification, getPendingVerifications, updateVerification, getMyVerificationStatus, getAdminVerificationLogRaw };
