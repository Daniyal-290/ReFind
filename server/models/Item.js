import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['lost', 'found'],
        required: [true, 'Item type (lost/found) is required']
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Electronics', 'Documents/IDs', 'Keys', 'Bags/Wallets', 'Clothing', 'Books', 'Other']
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
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
}, {
    timestamps: true
});

// Index for search functionality
itemSchema.index({ title: 'text', description: 'text', location: 'text' });

const Item = mongoose.model('Item', itemSchema);

export default Item;
