import express from 'express';
import User from '../models/User.js';
import Item from '../models/Item.js';
import Claim from '../models/Claim.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Admin only
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const bannedUsers = await User.countDocuments({ isBanned: true });
        const totalItems = await Item.countDocuments();
        const activeItems = await Item.countDocuments({ status: 'active' });
        const resolvedItems = await Item.countDocuments({ status: 'resolved' });
        const lostItems = await Item.countDocuments({ type: 'lost' });
        const foundItems = await Item.countDocuments({ type: 'found' });
        const totalClaims = await Claim.countDocuments();
        const pendingClaims = await Claim.countDocuments({ status: 'pending' });

        res.json({
            success: true,
            data: {
                users: { total: totalUsers, banned: bannedUsers },
                items: { total: totalItems, active: activeItems, resolved: resolvedItems, lost: lostItems, found: foundItems },
                claims: { total: totalClaims, pending: pendingClaims }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin only
router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;

        let query = { role: 'user' }; // Exclude admins from list

        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/admin/users/:id/ban
// @desc    Ban or unban a user
// @access  Admin only
router.put('/users/:id/ban', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Cannot ban an admin user'
            });
        }

        // Toggle ban status
        user.isBanned = !user.isBanned;
        await user.save();

        res.json({
            success: true,
            message: user.isBanned ? 'User has been banned' : 'User has been unbanned',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/admin/items
// @desc    Get all items for moderation
// @access  Admin only
router.get('/items', async (req, res) => {
    try {
        const { page = 1, limit = 20, type, status } = req.query;

        let query = {};
        if (type) query.type = type;
        if (status) query.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const items = await Item.find(query)
            .populate('posted_by', 'username email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Item.countDocuments(query);

        res.json({
            success: true,
            data: items,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/admin/items/:id
// @desc    Delete any item (admin moderation)
// @access  Admin only
router.delete('/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        // Delete associated claims
        await Claim.deleteMany({ item_id: req.params.id });

        // Delete the item
        await Item.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Item and associated claims deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
