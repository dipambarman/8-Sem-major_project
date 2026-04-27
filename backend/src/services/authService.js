import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRY } from '../config/jwt.js';

/**
 * AuthService — centralizes password hashing, comparison, and JWT operations.
 * All auth-related controllers should delegate to this service.
 */
class AuthService {
  async hashPassword(password, rounds = 12) {
    return bcrypt.hash(password, rounds);
  }

  async comparePassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  generateToken(payload, expiresIn = JWT_EXPIRY) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
}

export default new AuthService();