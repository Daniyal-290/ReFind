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
        required: [true, 'Please provide a message explaining your claim'],
        maxlength: [500, 'Message cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

// Prevent duplicate claims by same user on same item
claimSchema.index({ item_id: 1, claimer_id: 1 }, { unique: true });

const Claim = mongoose.model('Claim', claimSchema);

export default Claim;
