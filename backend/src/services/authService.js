const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here';

class AuthService {
    async hashPassword(password) {
        return bcrypt.hash(password, 10);
    }

    async comparePassword(password, hash) {
        return bcrypt.compare(password, hash);
    }

    generateToken(userId, email) {
        return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '24h' });
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return null;
        }
    }

    async register(user) {
        user.password = await this.hashPassword(user.password);
        return user;
    }

    async login(user, password) {
        const isValid = await this.comparePassword(password, user.password);
        if (!isValid) throw new Error('Invalid credentials');
        return this.generateToken(user.id, user.email);
    }
}

module.exports = new AuthService();