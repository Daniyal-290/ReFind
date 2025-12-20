import express from 'express';
import Claim from '../models/Claim.js';
import Item from '../models/Item.js';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { claimLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// @route   POST /api/claims
// @desc    Create a claim request for an item
// @access  Private
router.post('/', protect, claimLimiter, async (req, res) => {
    try {
        const { item_id, request_message } = req.body;

        // Find the item
        const item = await Item.findById(item_id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        // Check if item is still active
        if (item.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'This item has already been resolved'
            });
        }

        // Can't claim your own item
        if (item.posted_by.toString() === req.user._id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot claim your own item'
            });
        }

        // Check if user already has a pending claim on this item
        const existingClaim = await Claim.findOne({
            item_id,
            claimer_id: req.user._id
        });

        if (existingClaim) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted a claim for this item'
            });
        }

        // Create claim
        const claim = await Claim.create({
            item_id,
            claimer_id: req.user._id,
            finder_id: item.posted_by,
            request_message
        });

        res.status(201).json({
            success: true,
            data: claim
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/claims/sent
// @desc    Get claims sent by current user
// @access  Private
router.get('/sent', protect, async (req, res) => {
    try {
        const claims = await Claim.find({ claimer_id: req.user._id })
            .populate('item_id', 'title type category image_url')
            .populate('finder_id', 'username email contact_number')
            .sort({ createdAt: -1 });

        // Only reveal contact info if claim is approved
        const processedClaims = claims.map(claim => {
            const claimObj = claim.toObject();
            if (claim.status !== 'approved') {
                claimObj.finder_id = {
                    _id: claim.finder_id._id,
                    username: claim.finder_id.username
                    // Hide email and contact_number until approved
                };
            }
            return claimObj;
        });

        res.json({
            success: true,
            data: processedClaims
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/claims/received
// @desc    Get claims received on user's items
// @access  Private
router.get('/received', protect, async (req, res) => {
    try {
        const claims = await Claim.find({ finder_id: req.user._id })
            .populate('item_id', 'title type category image_url')
            .populate('claimer_id', 'username email contact_number')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: claims
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/claims/:id/approve
// @desc    Approve a claim request
// @access  Private (finder only)
router.put('/:id/approve', protect, async (req, res) => {
    try {
        const claim = await Claim.findById(req.params.id);

        if (!claim) {
            return res.status(404).json({
                success: false,
                message: 'Claim not found'
            });
        }

        // Check if current user is the finder
        if (claim.finder_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to approve this claim'
            });
        }

        // Update claim status
        claim.status = 'approved';
        await claim.save();

        // Optionally mark item as resolved
        await Item.findByIdAndUpdate(claim.item_id, { status: 'resolved' });

        // Return claim with claimer contact info
        const populatedClaim = await Claim.findById(claim._id)
            .populate('item_id', 'title type category')
            .populate('claimer_id', 'username email contact_number');

        res.json({
            success: true,
            message: 'Claim approved! Contact details have been shared.',
            data: populatedClaim
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/claims/:id/reject
// @desc    Reject a claim request
// @access  Private (finder only)
router.put('/:id/reject', protect, async (req, res) => {
    try {
        const claim = await Claim.findById(req.params.id);

        if (!claim) {
            return res.status(404).json({
                success: false,
                message: 'Claim not found'
            });
        }

        // Check if current user is the finder
        if (claim.finder_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to reject this claim'
            });
        }

        claim.status = 'rejected';
        await claim.save();

        res.json({
            success: true,
            message: 'Claim rejected',
            data: claim
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
