import mongoose from 'mongoose';
import { hash } from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not set. Create a .env.local file with your connection string.');
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, unique: true, lowercase: true },
    password: { type: String, select: false },
    role: String,
    department: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  const User = mongoose.models.User || mongoose.model('User', UserSchema);

  const users = [
    {
      firstName: 'Rachid',
      lastName: 'Amrani',
      email: 'admin@medicore.com',
      password: await hash('admin123', 12),
      role: 'admin',
      department: 'Administration',
    },
    {
      firstName: 'Fatima',
      lastName: 'Benkirane',
      email: 'doctor@medicore.com',
      password: await hash('doctor123', 12),
      role: 'doctor',
      department: 'Cardiology',
    },
    {
      firstName: 'Karim',
      lastName: 'Tazi',
      email: 'nurse@medicore.com',
      password: await hash('nurse123', 12),
      role: 'nurse',
      department: 'General',
    },
    {
      firstName: 'Nadia',
      lastName: 'Alaoui',
      email: 'lab@medicore.com',
      password: await hash('lab123', 12),
      role: 'lab-tech',
      department: 'Laboratory',
    },
    {
      firstName: 'Omar',
      lastName: 'Sebti',
      email: 'pharmacist@medicore.com',
      password: await hash('pharma123', 12),
      role: 'pharmacist',
      department: 'Pharmacy',
    },
    {
      firstName: 'Laila',
      lastName: 'Chraibi',
      email: 'receptionist@medicore.com',
      password: await hash('reception123', 12),
      role: 'receptionist',
      department: 'Reception',
    },
    {
      firstName: 'Youssef',
      lastName: 'Moussaoui',
      email: 'billing@medicore.com',
      password: await hash('billing123', 12),
      role: 'billing',
      department: 'Finance',
    },
  ];

  for (const userData of users) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) {
      console.log(`  Skipped (exists): ${userData.email}`);
    } else {
      await User.create(userData);
      console.log(`  Created: ${userData.email} (${userData.role})`);
    }
  }

  console.log('\nSeed complete. Users:');
  console.log('  admin@medicore.com / admin123');
  console.log('  doctor@medicore.com / doctor123');
  console.log('  nurse@medicore.com / nurse123');
  console.log('  lab@medicore.com / lab123');
  console.log('  pharmacist@medicore.com / pharma123');
  console.log('  receptionist@medicore.com / reception123');
  console.log('  billing@medicore.com / billing123');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
