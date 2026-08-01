const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/elderly.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, ctrl.getAllElderly);
router.post('/', authMiddleware, checkRole('Admin', 'Family'), ctrl.createElderly);
router.get('/:id', authMiddleware, ctrl.getElderlyById);
router.put('/:id', authMiddleware, checkRole('Admin', 'Family'), ctrl.updateElderly);
router.delete('/:id', authMiddleware, checkRole('Admin'), ctrl.deleteElderly);

// Notes
router.get('/:id/notes', authMiddleware, ctrl.getNotes);
router.post('/:id/notes', authMiddleware, checkRole('Admin', 'Family'), ctrl.addNote);
router.delete('/:id/notes/:noteId', authMiddleware, checkRole('Admin', 'Family'), ctrl.deleteNote);

// Emergency Contacts
router.get('/:id/contacts', authMiddleware, ctrl.getContacts);
router.post('/:id/contacts', authMiddleware, checkRole('Admin', 'Family'), ctrl.addContact);
router.delete('/:id/contacts/:contactId', authMiddleware, checkRole('Admin', 'Family'), ctrl.deleteContact);

// Residence
router.get('/:id/residence', authMiddleware, ctrl.getResidence);

module.exports = router;
