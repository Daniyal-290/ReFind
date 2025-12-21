import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error('MongoDB error:', err.message);
        process.exit(1);
    });

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contact_number: String,
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isBanned: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function seedAdmin() {
    try {
        const existing = await User.findOne({ email: 'admin@refind.com' });

        if (existing) {
            console.log('Admin already exists');
            console.log('Email: admin@refind.com');
            console.log('Password: admin123');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);

        await User.create({
            username: 'admin',
            email: 'admin@refind.com',
            password: hashedPassword,
            contact_number: '+92 300 0000000',
            role: 'admin'
        });

        console.log('Admin created!');
        console.log('Email: admin@refind.com');
        console.log('Password: admin123');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

seedAdmin();