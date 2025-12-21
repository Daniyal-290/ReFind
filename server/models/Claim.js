import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema({
    item_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },
    claimer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    finder_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    request_message: {
        type: String,
        required: true,
        maxlength: 500
    }
}, { timestamps: true });

claimSchema.index({ item_id: 1, claimer_id: 1 });

export default mongoose.model('Claim', claimSchema);
