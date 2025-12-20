import express from 'express';
import Item from '../models/Item.js';
import { protect } from '../middleware/authMiddleware.js';
import { apiLimiter } from '../middleware/rateLimiter.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// @route   GET /api/items
// @desc    Get all items with filters
// @access  Public
router.get('/', apiLimiter, async (req, res) => {
    try {
        const { type, category, location, status, search, page = 1, limit = 10 } = req.query;

        // Build query
        let query = {};

        if (type) query.type = type;
        if (category) query.category = category;
        if (location) query.location = { $regex: location, $options: 'i' };
        if (status) query.status = status;
        else query.status = 'active'; // Default to active items

        // Text search
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

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

// @route   GET /api/items/my-items
// @desc    Get current user's items
// @access  Private
router.get('/my-items', protect, async (req, res) => {
    try {
        const items = await Item.find({ posted_by: req.user._id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: items
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/items/:id
// @desc    Get single item
// @access  Public
router.get('/:id', apiLimiter, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id)
            .populate('posted_by', 'username email contact_number');

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/items
// @desc    Create a new item
// @access  Private
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

        res.status(201).json({
            success: true,
            data: item
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/items/:id
// @desc    Update an item
// @access  Private (owner only)
router.put('/:id', protect, upload.single('image'), async (req, res) => {
    try {
        let item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        // Check ownership
        if (item.posted_by.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this item'
            });
        }

        const { type, title, category, location, description, status } = req.body;

        item.type = type || item.type;
        item.title = title || item.title;
        item.category = category || item.category;
        item.location = location || item.location;
        item.description = description || item.description;
        item.status = status || item.status;

        if (req.file) {
            item.image_url = `/uploads/${req.file.filename}`;
        }

        await item.save();

        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/items/:id
// @desc    Delete an item
// @access  Private (owner only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        // Check ownership
        if (item.posted_by.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this item'
            });
        }

        await Item.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Item deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
