import express from 'express';
import Claim from '../models/Claim.js';
import Item from '../models/Item.js';
import { protect } from '../middleware/authMiddleware.js';
import { claimLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/', protect, claimLimiter, async (req, res) => {
    try {
        const { item_id, request_message } = req.body;

        const item = await Item.findById(item_id);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        if (item.status !== 'active') {
            return res.status(400).json({ success: false, message: 'Item already resolved' });
        }

        if (item.posted_by.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Cannot claim your own item' });
        }

        const existing = await Claim.findOne({
            item_id,
            claimer_id: req.user._id,
            status: { $in: ['pending', 'approved'] }
        });

        if (existing) {
            const msg = existing.status === 'approved' ? 'Already approved' : 'Already pending';
            return res.status(400).json({ success: false, message: msg });
        }

        const claim = await Claim.create({
            item_id,
            claimer_id: req.user._id,
            finder_id: item.posted_by,
            request_message
        });

        res.status(201).json({ success: true, data: claim });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/sent', protect, async (req, res) => {
    try {
        const claims = await Claim.find({ claimer_id: req.user._id })
            .populate('item_id', 'title type category image_url')
            .populate('finder_id', 'username email contact_number')
            .sort({ createdAt: -1 });

        const data = claims.map(claim => {
            const obj = claim.toObject();
            if (claim.status !== 'approved') {
                obj.finder_id = { _id: claim.finder_id._id, username: claim.finder_id.username };
            }
            return obj;
        });

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/received', protect, async (req, res) => {
    try {
        const claims = await Claim.find({ finder_id: req.user._id })
            .populate('item_id', 'title type category image_url')
            .populate('claimer_id', 'username email contact_number')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: claims });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/:id/approve', protect, async (req, res) => {
    try {
        const claim = await Claim.findById(req.params.id);
        if (!claim) {
            return res.status(404).json({ success: false, message: 'Claim not found' });
        }

        if (claim.finder_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        claim.status = 'approved';
        await claim.save();
        await Item.findByIdAndUpdate(claim.item_id, { status: 'resolved' });

        const populated = await Claim.findById(claim._id)
            .populate('item_id', 'title type category')
            .populate('claimer_id', 'username email contact_number');

        res.json({ success: true, message: 'Claim approved', data: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/:id/reject', protect, async (req, res) => {
    try {
        const claim = await Claim.findById(req.params.id);
        if (!claim) {
            return res.status(404).json({ success: false, message: 'Claim not found' });
        }

        if (claim.finder_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        claim.status = 'rejected';
        await claim.save();

        res.json({ success: true, message: 'Claim rejected', data: claim });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
