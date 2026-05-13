import bcrypt from 'bcrypt';

import mongoose from 'mongoose';

async function seedAdmin() {
  await mongoose.connect(
    'mongodb+srv://carlkanaan_stock_market:90egl4LXu9pPpZ55@stock-market-cluster.0iegb0h.mongodb.net/?appName=stock-market-cluster',
  );

  const cmsUsersCollection = mongoose.connection.collection('cmsusers');
  const existingAdmin = await cmsUsersCollection.findOne({
    email: 'omarh.admin@gmail.com',
  });

  if (existingAdmin) {
    console.log('Admin user already exists');

    process.exit();
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
  process.exit();
}
seedAdmin();
