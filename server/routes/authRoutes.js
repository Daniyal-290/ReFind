import express from 'express';
import User from '../models/User.js';
import { generateToken, protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/signup', authLimiter, async (req, res) => {
    try {
        const { username, email, password, contact_number } = req.body;

        const exists = await User.findOne({ $or: [{ email }, { username }] });
        if (exists) {
            const msg = exists.email === email ? 'Email already registered' : 'Username taken';
            return res.status(400).json({ success: false, message: msg });
        }

        const user = await User.create({ username, email, password, contact_number });
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                contact_number: user.contact_number,
                role: user.role,
                token
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (user.isBanned) {
            return res.status(403).json({ success: false, message: 'Account suspended' });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            data: {
                _id: user._id,
                username: user.username,
                email: user.email,
                contact_number: user.contact_number,
                role: user.role,
                token
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/profile', protect, async (req, res) => {
    try {
        const { username, contact_number } = req.body;
        const user = await User.findById(req.user._id);

        if (username) user.username = username;
        if (contact_number) user.contact_number = contact_number;
        await user.save();

        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
