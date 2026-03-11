import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Smart Canteen database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@smartcanteen.com' },
    update: {},
    create: {
      email: 'admin@smartcanteen.com',
      phone: '9876543210',
      fullName: 'System Administrator',
      password: hashedPassword,
      userType: 'ADMIN',
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create admin wallet
  await prisma.wallet.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      balance: 1000.00,
      isActive: true,
    },
  });

  // Create Gauhati University Canteen
  const vendor = await prisma.vendor.upsert({
    where: { email: 'canteen@gauhati.ac.in' },
    update: {},
    create: {
      name: 'Gauhati University Canteen',
      description: 'Main canteen serving delicious and affordable food for students and faculty',
      email: 'canteen@gauhati.ac.in',
      phone: '9876543211',
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

  // Create sample menu items
  const menuItems = [
    {
      name: 'Chicken Biryani',
      description: 'Fragrant basmati rice with tender chicken pieces and aromatic spices',
      price: 120.00,
      preparationTime: 25,
      category: 'MAIN_COURSE',
      isAvailable: true,
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
      isExpress: true,
      vendorId: vendor.id,
    },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.create({
      data: item,
    });
    console.log(`✅ Created menu item: ${item.name}`);
  }

  console.log('🎉 Database seeding completed successfully!');
  console.log(`
📊 Summary:
- 1 Admin user created
- 1 Admin wallet created with ₹1000 balance  
- 1 Vendor (Gauhati University Canteen) created
- ${menuItems.length} Menu items created

🔐 Admin Login:
Email: admin@smartcanteen.com
Password: admin123
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
