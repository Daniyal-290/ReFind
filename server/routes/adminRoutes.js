import express from 'express';
import User from '../models/User.js';
import Item from '../models/Item.js';
import Claim from '../models/Claim.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/stats', async (req, res) => {
    try {
        const [totalUsers, bannedUsers, totalItems, activeItems, resolvedItems, lostItems, foundItems, totalClaims, pendingClaims] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            User.countDocuments({ isBanned: true }),
            Item.countDocuments(),
            Item.countDocuments({ status: 'active' }),
            Item.countDocuments({ status: 'resolved' }),
            Item.countDocuments({ type: 'lost' }),
            Item.countDocuments({ type: 'found' }),
            Claim.countDocuments(),
            Claim.countDocuments({ status: 'pending' })
        ]);

        res.json({
            success: true,
            data: {
                users: { total: totalUsers, banned: bannedUsers },
                items: { total: totalItems, active: activeItems, resolved: resolvedItems, lost: lostItems, found: foundItems },
                claims: { total: totalClaims, pending: pendingClaims }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;

        let query = { role: 'user' };
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: users,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/users/:id/ban', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.role === 'admin') {
            return res.status(400).json({ success: false, message: 'Cannot ban admin' });
        }

        user.isBanned = !user.isBanned;
        await user.save();

        res.json({
            success: true,
            message: user.isBanned ? 'User banned' : 'User unbanned',
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/items', async (req, res) => {
    try {
        const { page = 1, limit = 20, type, status } = req.query;

        let query = {};
        if (type) query.type = type;
        if (status) query.status = status;

        const skip = (page - 1) * limit;
        const items = await Item.find(query)
            .populate('posted_by', 'username email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Item.countDocuments(query);

        res.json({
            success: true,
            data: items,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        await Claim.deleteMany({ item_id: req.params.id });
        await Item.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
