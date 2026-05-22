/**
 * Tạo (hoặc cập nhật) 1 tài khoản admin để test module quản trị.
 *
 * Usage:
 *   node seeds/seedAdminUser.js
 *
 * Có thể override bằng env:
 *   ADMIN_EMAIL=foo@bar.com ADMIN_PASSWORD=secret123 node seeds/seedAdminUser.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@toeic-ai.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Quản trị viên';

async function seed() {
  await connectDB();

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  const passwordHash = await User.hashPassword(ADMIN_PASSWORD);

  if (existing) {
    existing.fullName = ADMIN_NAME;
    existing.passwordHash = passwordHash;
    existing.role = 'admin';
    existing.isActive = true;
    await existing.save();
    console.log(`✓ Updated existing admin: ${ADMIN_EMAIL}`);
  } else {
    await User.create({
      fullName: ADMIN_NAME,
      email: ADMIN_EMAIL,
      passwordHash,
      role: 'admin',
      isActive: true,
      targetScore: 990,
    });
    console.log(`✓ Created new admin: ${ADMIN_EMAIL}`);
  }

  console.log('\n  Login credentials:');
  console.log(`    Email:    ${ADMIN_EMAIL}`);
  console.log(`    Password: ${ADMIN_PASSWORD}\n`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('\n✗ Seed admin failed:', err);
  process.exit(1);
});
