import mongoose from 'mongoose';
import { hash } from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) { console.error('MONGODB_URI not set'); process.exit(1); }

async function run() {
  console.log('Connecting...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected. Dropping database...');
  await mongoose.connection.db!.dropDatabase();
  console.log('Database cleared.');

  const UserSchema = new mongoose.Schema({
    firstName: String, lastName: String,
    email: { type: String, unique: true, lowercase: true },
    password: { type: String, select: false },
    role: String, department: String,
    isActive: { type: Boolean, default: true },
  }, { timestamps: true });

  const User = mongoose.model('User', UserSchema);
  const pw = await hash('admin123', 12);
  await User.create({
    firstName: 'Admin',
    lastName: 'Admin',
    email: 'admin@medicore.com',
    password: pw,
    role: 'admin',
    department: 'Administration',
  });

  console.log('\nAdmin user created:');
  console.log('  Email: admin@medicore.com');
  console.log('  Password: admin123');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => { console.error('Failed:', err); process.exit(1); });
