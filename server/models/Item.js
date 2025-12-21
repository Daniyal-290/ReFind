import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['lost', 'found'],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    category: {
        type: String,
        required: true,
        enum: ['Electronics', 'Documents/IDs', 'Keys', 'Bags/Wallets', 'Clothing', 'Books', 'Other']
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 1000
    },
    image_url: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'resolved'],
        default: 'active'
    },
    posted_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

itemSchema.index({ title: 'text', description: 'text', location: 'text' });

export default mongoose.model('Item', itemSchema);
