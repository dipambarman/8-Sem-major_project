const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Placeholder for User model
// const User = require('../models/User');

// Register route
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: 'All fields required' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // TODO: Save user to database
        // const user = await User.create({ email, password: hashedPassword, name });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password required' });
        }

        // TODO: Find user in database
        // const user = await User.findOne({ email });
        // if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        // TODO: Compare password
        // const isValid = await bcrypt.compare(password, user.password);
        // if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

        // TODO: Generate JWT token
        // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ message: 'Login successful', token: null });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;