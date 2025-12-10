const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../config/logger');

class AuthController {
  // Register new user
  async register(req, res, next) {
    try {
      const { email, password, fullName } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email already registered'
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        email,
        passwordHash,
        fullName
      });

      // Generate token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      logger.info('User registered', { userId: user.id, email: user.email });

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      logger.info('User logged in', { userId: user.id, email: user.email });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get current user
  async getCurrentUser(req, res, next) {
    try {
      const user = req.user;

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();