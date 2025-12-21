import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        if (req.user.isBanned) {
            return res.status(403).json({ success: false, message: 'Account suspended' });
        }

        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

export const adminOnly = (req, res, next) => {
    if (req.user?.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Admin access required' });
    }
};

export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};
