import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

async function seedAdmin() {
  const MONGO_URI = process.env.MONGO_URI;

  if (!MONGO_URI) {
    throw new Error('MONGO_URI is missing from .env');
  }

  await mongoose.connect(MONGO_URI);
  const cmsUsersCollection = mongoose.connection.collection('cmsusers');
  const existingAdmin = await cmsUsersCollection.findOne({
    email: 'omarh.admin@gmail.com',
  });

  if (existingAdmin) {
    console.log('Admin user already exists');
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash('Omar123Admin', 10);

  await cmsUsersCollection.insertOne({
    fullName: 'Omar Halabi',
    email: 'omarh.admin@gmail.com',
    password: hashedPassword,
    role: 'ADMIN',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log('Omar admin seeded successfully');
  await mongoose.disconnect();
}
seedAdmin();
