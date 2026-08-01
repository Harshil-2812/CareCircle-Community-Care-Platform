const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { validate, registerSchema, loginSchema } = require('../middleware/validateMiddleware');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authMiddleware, getMe);

module.exports = router;
