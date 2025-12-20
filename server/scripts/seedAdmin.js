import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// User Schema (inline to avoid import issues)
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    contact_number: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isBanned: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function seedAdmin() {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@refind.com' });

        if (existingAdmin) {
            console.log('Admin user already exists!');
            console.log('Email: admin@refind.com');
            console.log('Password: admin123');
            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        // Create admin user
        const admin = await User.create({
            username: 'admin',
            email: 'admin@refind.com',
            password: hashedPassword,
            contact_number: '+92 300 0000000',
            role: 'admin'
        });

        console.log('\n✅ Admin user created successfully!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:    admin@refind.com');
        console.log('🔑 Password: admin123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}

seedAdmin();
