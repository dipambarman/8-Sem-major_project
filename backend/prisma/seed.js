import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Smart Canteen database seed...');

  // ─── ADMIN USER ──────────────────────────────────────────────────────

  const hashedAdminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@smartcanteen.com' },
    update: {},
    create: {
      email: 'admin@smartcanteen.com',
      passwordHash: hashedAdminPassword,
      fullName: 'System Administrator',
      phone: '9876543210',
      userType: 'ADMIN',
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Admin wallet
  await prisma.wallet.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      balance: 1000.00,
      isActive: true,
    },
  });

  // ─── VENDOR ──────────────────────────────────────────────────────────

  const hashedVendorPassword = await bcrypt.hash('vendor123', 12);
  const vendor = await prisma.vendor.upsert({
    where: { email: 'canteen@gauhati.ac.in' },
    update: {},
    create: {
      name: 'Gauhati University Canteen',
      description: 'Main canteen serving delicious and affordable food for students and faculty',
      email: 'canteen@gauhati.ac.in',
      phone: '9876543211',
      password: hashedVendorPassword,
      address: 'Gauhati University Campus, Jalukbari, Guwahati, Assam 781014',
      operatingHours: {
        monday: { open: '08:00', close: '22:00' },
        tuesday: { open: '08:00', close: '22:00' },
        wednesday: { open: '08:00', close: '22:00' },
        thursday: { open: '08:00', close: '22:00' },
        friday: { open: '08:00', close: '22:00' },
        saturday: { open: '08:00', close: '22:00' },
        sunday: { open: '09:00', close: '21:00' }
      },
      cuisineType: ['Indian', 'Continental', 'Snacks', 'Beverages'],
      isActive: true,
      rating: 4.5,
      licenseNumber: 'GU_CANTEEN_2025',
    },
  });

  console.log('✅ Created vendor:', vendor.name);

  // ─── MENU ITEMS ──────────────────────────────────────────────────────

  const menuItems = [
    {
      name: 'Chicken Biryani',
      description: 'Fragrant basmati rice with tender chicken pieces and aromatic spices',
      price: 120.00,
      preparationTime: 25,
      category: 'MAIN_COURSE',
      isAvailable: true,
      isFeatured: true,
      isExpress: false,
      vendorId: vendor.id,
    },
    {
      name: 'Masala Chai',
      description: 'Traditional Indian spiced tea with milk',
      price: 15.00,
      preparationTime: 5,
      category: 'BEVERAGES',
      isAvailable: true,
      isFeatured: false,
      isExpress: true,
      vendorId: vendor.id,
    },
    {
      name: 'Veg Sandwich',
      description: 'Fresh vegetables with mint chutney and butter',
      price: 40.00,
      preparationTime: 10,
      category: 'SNACKS',
      isAvailable: true,
      isFeatured: false,
      isExpress: true,
      vendorId: vendor.id,
    },
    {
      name: 'Fish Curry Rice',
      description: 'Traditional Assamese fish curry with steamed rice',
      price: 90.00,
      preparationTime: 20,
      category: 'MAIN_COURSE',
      isAvailable: true,
      isFeatured: true,
      isExpress: false,
      vendorId: vendor.id,
    },
    {
      name: 'Samosa (2 pieces)',
      description: 'Crispy fried pastry with spiced potato filling',
      price: 25.00,
      preparationTime: 5,
      category: 'SNACKS',
      isAvailable: true,
      isFeatured: false,
      isExpress: true,
      vendorId: vendor.id,
    },
    {
      name: 'Cold Coffee',
      description: 'Rich and creamy iced coffee with whipped cream',
      price: 45.00,
      preparationTime: 5,
      category: 'BEVERAGES',
      isAvailable: true,
      isFeatured: true,
      isExpress: true,
      vendorId: vendor.id,
    },
    {
      name: 'Paneer Butter Masala',
      description: 'Soft paneer cubes in rich tomato-butter gravy with naan',
      price: 110.00,
      preparationTime: 20,
      category: 'MAIN_COURSE',
      isAvailable: true,
      isFeatured: false,
      isExpress: false,
      vendorId: vendor.id,
    },
    {
      name: 'Gulab Jamun (3 pieces)',
      description: 'Deep-fried milk dumplings soaked in rose-flavored sugar syrup',
      price: 35.00,
      preparationTime: 5,
      category: 'DESSERTS',
      isAvailable: true,
      isFeatured: false,
      isExpress: true,
      vendorId: vendor.id,
    },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: {
        id: 0 // Force creation (will auto-increment)
      },
      update: {},
      create: item,
    });
    console.log(`✅ Created menu item: ${item.name}`);
  }

  // ─── SAMPLE TEST USER ────────────────────────────────────────────────

  const hashedUserPassword = await bcrypt.hash('test123', 12);
  const testUser = await prisma.user.upsert({
    where: { email: 'student@gauhati.ac.in' },
    update: {},
    create: {
      email: 'student@gauhati.ac.in',
      passwordHash: hashedUserPassword,
      fullName: 'Test Student',
      phone: '9876543212',
      userType: 'REGULAR',
      isActive: true,
    },
  });

  await prisma.wallet.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      balance: 500.00,
      isActive: true,
    },
  });

  console.log('✅ Created test user:', testUser.email);

  console.log(`
🎉 Database seeding completed successfully!

📊 Summary:
- 1 Admin user (admin@smartcanteen.com / admin123)
- 1 Vendor (canteen@gauhati.ac.in / vendor123)
- 1 Test user (student@gauhati.ac.in / test123)
- ${menuItems.length} Menu items created
- Admin wallet: ₹1000 | Test user wallet: ₹500

🔐 Credentials:
Admin:   admin@smartcanteen.com / admin123
Vendor:  canteen@gauhati.ac.in / vendor123
Student: student@gauhati.ac.in / test123
  `);
}

main()
  .catch((e) => {
    console.error('❌ Database seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
