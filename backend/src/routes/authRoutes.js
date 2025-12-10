const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const Joi = require('joi');
const { validate } = require('../middleware/validation');

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().min(2).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// POST /api/auth/register - Register new user
router.post('/register',
  authLimiter,
  validate(registerSchema),
  authController.register
);

// POST /api/auth/login - Login
router.post('/login',
  authLimiter,
  validate(loginSchema),
  authController.login
);

// GET /api/auth/me - Get current user
router.get('/me',
  authenticateToken,
  authController.getCurrentUser
);

module.exports = router;