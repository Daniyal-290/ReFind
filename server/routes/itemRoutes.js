import express from 'express';
import Item from '../models/Item.js';
import { protect } from '../middleware/authMiddleware.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/', apiLimiter, async (req, res) => {
    try {
        const { type, category, location, status, search, page = 1, limit = 10 } = req.query;

        let query = { status: status || 'active' };
        if (type) query.type = type;
        if (category) query.category = category;
        if (location) query.location = { $regex: location, $options: 'i' };
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const items = await Item.find(query)
            .populate('posted_by', 'username')
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
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/my-items', protect, async (req, res) => {
    try {
        const items = await Item.find({ posted_by: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/:id', apiLimiter, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id)
            .populate('posted_by', 'username email contact_number');

        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        res.json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        const { type, title, category, location, description } = req.body;

        const item = await Item.create({
            type,
            title,
            category,
            location,
            description,
            image_url: req.file ? `/uploads/${req.file.filename}` : null,
            posted_by: req.user._id
        });

        res.status(201).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.put('/:id', protect, upload.single('image'), async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        if (item.posted_by.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const { type, title, category, location, description, status } = req.body;
        Object.assign(item, {
            type: type || item.type,
            title: title || item.title,
            category: category || item.category,
            location: location || item.location,
            description: description || item.description,
            status: status || item.status
        });

        if (req.file) item.image_url = `/uploads/${req.file.filename}`;
        await item.save();

        res.json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.delete('/:id', protect, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        if (item.posted_by.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await Item.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
