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
    // ── BREAKFAST ITEMS ──
    {
      name: 'Masala Dosa',
      description: 'Crispy crepe made from rice and lentil batter, filled with spiced potatoes and onions',
      price: 65.00,
      preparationTime: 12,
      category: 'BREAKFAST',
      isAvailable: true,
      isFeatured: true,
      isExpress: false,
      vendorId: vendor.id,
    },
    {
      name: 'Idli with Sambar',
      description: 'Soft steamed rice cakes served with tangy sambar and coconut chutney',
      price: 50.00,
      preparationTime: 10,
      category: 'BREAKFAST',
      isAvailable: true,
      isFeatured: true,
      isExpress: false,
      vendorId: vendor.id,
    },
    {
      name: 'Vegetable Upma',
      description: 'Roasted semolina cooked with vegetables and spices, light and nutritious',
      price: 45.00,
      preparationTime: 10,
      category: 'BREAKFAST',
      isAvailable: true,
      isFeatured: false,
      isExpress: true,
      vendorId: vendor.id,
    },
    {
      name: 'Aloo Paratha',
      description: 'Fluffy wheat bread stuffed with spiced mashed potatoes, served with yogurt',
      price: 55.00,
      preparationTime: 15,
      category: 'BREAKFAST',
      isAvailable: true,
      isFeatured: false,
      isExpress: false,
      vendorId: vendor.id,
    },
    {
      name: 'Pav Bhaji',
      description: 'Spiced vegetable mixture served with buttered bread rolls',
      price: 60.00,
      preparationTime: 12,
      category: 'BREAKFAST',
      isAvailable: true,
      isFeatured: false,
      isExpress: false,
      vendorId: vendor.id,
    },
    {
      name: 'Poha',
      description: 'Flattened rice cooked with potatoes, peanuts, and fresh herbs',
      price: 40.00,
      preparationTime: 8,
      category: 'BREAKFAST',
      isAvailable: true,
      isFeatured: false,
      isExpress: true,
      vendorId: vendor.id,
    },

    // ── MAIN COURSE ITEMS ──
    {
      name: 'Chicken Biryani',
      description: 'Fragrant basmati rice with tender chicken pieces and aromatic spices, a classic favorite',
      price: 120.00,
      preparationTime: 25,
      category: 'MAIN_COURSE',
      isAvailable: true,
      isFeatured: true,
      isExpress: false,
      vendorId: vendor.id,
    },
    {
      name: 'Fish Curry Rice',
      description: 'Traditional Assamese fish curry with steamed rice, a local favorite',
      price: 90.00,
      preparationTime: 20,
      category: 'MAIN_COURSE',
      isAvailable: true,
      isFeatured: true,
      isExpress: false,
      vendorId: vendor.id,
    },
    {
      name: 'Paneer Butter Masala',
      description: 'Soft paneer cubes in rich tomato-butter gravy with butter naan',
      price: 110.00,
      preparationTime: 20,
      category: 'MAIN_COURSE',
      isAvailable: true,
      isFeatured: false,
      isExpress: false,
      vendorId: vendor.id,
    },
    {
      name: 'Dal Makhani',
      description: 'Creamy black lentil curry with beans, cooked overnight and finished with cream',
      price: 85.00,
      preparationTime: 15,
      category: 'MAIN_COURSE',
      isAvailable: true,
      isFeatured: false,
      isExpress: false,
      vendorId: vendor.id,
    },
    {
      name: 'Butter Chicken',
      description: 'Tender chicken tikka pieces in a smooth tomato and butter cream sauce',
      price: 115.00,
      preparationTime: 22,
      category: 'MAIN_COURSE',
      isAvailable: true,
      isFeatured: true,
      isExpress: false,
      vendorId: vendor.id,
    },
    {
      name: 'Vegetable Biryani',
      description: 'Fragrant basmati rice layered with mixed vegetables and exotic spices',
      price: 95.00,
      preparationTime: 22,
      category: 'MAIN_COURSE',
      isAvailable: true,
      isFeatured: false,
      isExpress: false,
      vendorId: vendor.id,
    },
    {
      name: 'Chole Bhature',
      description: 'Spiced chickpeas curry served with deep-fried bhature bread',
      price: 75.00,
      preparationTime: 18,
      category: 'MAIN_COURSE',
      isAvailable: true,
      isFeatured: false,
      isExpress: false,
      vendorId: vendor.id,
    },
    {
      name: 'Tandoori Chicken Rice',
      description: 'Grilled tandoori chicken pieces with fragrant basmati rice and mint raita',
      price: 125.00,
      preparationTime: 23,
      category: 'MAIN_COURSE',
      isAvailable: true,
      isFeatured: true,
      isExpress: false,
      vendorId: vendor.id,
    },
    {
      name: 'Rajma Rice',
      description: 'Kidney beans in aromatic tomato gravy served with steamed rice',
      price: 70.00,
      preparationTime: 12,
      category: 'MAIN_COURSE',
      isAvailable: true,
      isFeatured: false,
      isExpress: true,
      vendorId: vendor.id,
    },

    // ── SNACKS ITEMS ──
    {
      name: 'Samosa (2 pieces)',
      description: 'Crispy fried pastry with spiced potato and pea filling',
      price: 25.00,
      preparationTime: 5,
      category: 'SNACKS',
      isAvailable: true,
      isFeatured: false,
      isExpress: true,
      vendorId: vendor.id,
    },
    {
      name: 'Vegetable Pakora',
      description: 'Mixed vegetables dipped in spiced gram flour batter and deep-fried',
      price: 50.00,
      preparationTime: 10,
      category: 'SNACKS',
      isAvailable: true,
      isFeatured: false,
      isExpress: true,
      vendorId: vendor.id,
    },
    {
      name: 'Paneer Pakora',
      description: 'Soft paneer cubes in spiced gram flour batter, deep-fried until golden',
      price: 65.00,
      preparationTime: 8,
      category: 'SNACKS',
      isAvailable: true,
      isFeatured: true,
      isExpress: true,
      vendorId: vendor.id,
    },
    {
      name: 'Aloo Tikki (2 pieces)',
      description: 'Crispy potato patties with spices and herbs, served with mint chutney',
      price: 35.00,
      preparationTime: 8,
      category: 'SNACKS',
      isAvailable: true,
      isFeatured: false,
      isExpress: true,
      vendorId: vendor.id,
    },
    {
      name: 'Onion Bhaji',
      description: 'Crispy fried onion fritters with gram flour, a classic quick bite',
      price: 30.00,
      preparationTime: 7,
      category: 'SNACKS',
      isAvailable: true,
      isFeatured: false,
      isExpress: true,
      vendorId: vendor.id,
    },
    {
      name: 'Veg Sandwich',
      description: 'Fresh vegetables with mint chutney and cheese between grilled bread',
      price: 40.00,
      preparationTime: 10,
      category: 'SNACKS',
      isAvailable: true,
      isFeatured: false,
      isExpress: true,
      vendorId: vendor.id,
    },
    {
      name: 'Chaat Mix Platter',
      description: 'Assorted Indian street food: sev tamatar, bhel puri, and papdi chaat',
      price: 85.00,
      preparationTime: 10,
      category: 'SNACKS',
      isAvailable: true,
      isFeatured: false,
      isExpress: false,
      vendorId: vendor.id,
    },
    {
      name: 'Momos (6 pieces)',
      description: 'Steamed vegetable dumplings served with spicy chili sauce',
      price: 55.00,
      preparationTime: 12,
      category: 'SNACKS',
      isAvailable: true,
      isFeatured: false,
      isExpress: false,
      vendorId: vendor.id,
    },

    // ── DESSERTS ITEMS ──
    {
      name: 'Gulab Jamun (3 pieces)',
      description: 'Deep-fried milk dumplings soaked in rose-flavored sugar syrup',
      price: 35.00,
      preparationTime: 5,
      category: 'DESSERTS',
      isAvailable: true,
      isFeatured: true,
      isExpress: true,
      vendorId: vendor.id,
    },
    {
      name: 'Kheer',
      description: 'Creamy rice pudding flavored with cardamom, nuts, and a hint of saffron',
      price: 45.00,
      preparationTime: 8,
      category: 'DESSERTS',
      isAvailable: true,
      isFeatured: false,
      isExpress: true,
      vendorId: vendor.id,
    },
    {
      name: 'Rasgulla (3 pieces)',
      description: 'Soft cheese balls in light sugar syrup, a Bengali delicacy',
      price: 40.00,
      preparationTime: 5,
      category: 'DESSERTS',
      isAvailable: true,
      isFeatured: false,
      isExpress: true,
      vendorId: vendor.id,
    },
    {
      name: 'Jalebi',
      description: 'Crispy spiral pastry soaked in sugar syrup, served warm',
      price: 30.00,
      preparationTime: 5,
      category: 'DESSERTS',
      isAvailable: true,
      isFeatured: false,
      isExpress: true,
      vendorId: vendor.id,
    },
    {
      name: 'Gajar Halwa',
      description: 'Slow-cooked carrot pudding with milk, ghee, and nuts',
      price: 50.00,
      preparationTime: 10,
      category: 'DESSERTS',
      isAvailable: true,
      isFeatured: false,
      isExpress: false,
      vendorId: vendor.id,
    },
    {
      name: 'Ice Cream Sundae',
      description: 'Vanilla ice cream topped with chocolate syrup, nuts, and cherry',
      price: 60.00,
      preparationTime: 3,
      category: 'DESSERTS',
      isAvailable: true,
      isFeatured: false,
      isExpress: true,
      vendorId: vendor.id,
    },

    // ── BEVERAGES ITEMS ──
    {
      name: 'Masala Chai',
      description: 'Traditional Indian spiced tea with milk, warming and aromatic',
      price: 15.00,
      preparationTime: 5,
      category: 'BEVERAGES',
      isAvailable: true,
      isFeatured: false,
      isExpress: true,
      vendorId: vendor.id,
    },
    {
      name: 'Cold Coffee',
      description: 'Rich and creamy iced coffee with whipped cream topping',
      price: 45.00,
      preparationTime: 5,
      category: 'BEVERAGES',
      isAvailable: true,
      isFeatured: true,
      isExpress: true,
      vendorId: vendor.id,
    },
    {
      name: 'Fresh Orange Juice',
      description: 'Freshly squeezed orange juice, no added sugar, refreshing and healthy',
      price: 50.00,
      preparationTime: 5,
      category: 'BEVERAGES',
      isAvailable: true,
      isFeatured: false,
      isExpress: true,
      vendorId: vendor.id,
    },
    {
      name: 'Mango Lassi',
      description: 'Creamy yogurt drink blended with fresh mango pulp and cardamom',
      price: 55.00,
      preparationTime: 3,
      category: 'BEVERAGES',
      isAvailable: true,
      isFeatured: true,
      isExpress: true,
      vendorId: vendor.id,
    },
    {
      name: 'Hot Chocolate',
      description: 'Rich hot chocolate made with premium cocoa and milk',
      price: 35.00,
      preparationTime: 5,
      category: 'BEVERAGES',
      isAvailable: true,
      isFeatured: false,
      isExpress: true,
      vendorId: vendor.id,
    },
    {
      name: 'Chilled Badam Milk',
      description: 'Cold milk blended with almond paste and topped with nuts',
      price: 40.00,
      preparationTime: 3,
      category: 'BEVERAGES',
      isAvailable: true,
      isFeatured: false,
      isExpress: true,
      vendorId: vendor.id,
    },
    {
      name: 'Watermelon Juice',
      description: 'Fresh watermelon juice blended with a touch of lime and mint',
      price: 45.00,
      preparationTime: 3,
      category: 'BEVERAGES',
      isAvailable: true,
      isFeatured: false,
      isExpress: true,
      vendorId: vendor.id,
    },
    {
      name: 'Coffee',
      description: 'Premium filter coffee or instant coffee with milk',
      price: 25.00,
      preparationTime: 4,
      category: 'BEVERAGES',
      isAvailable: true,
      isFeatured: false,
      isExpress: true,
      vendorId: vendor.id,
    },
  ];

  // Use createMany for efficient bulk insert (skip if already exists by name-vendor combo)
  for (const item of menuItems) {
    // Check if item already exists for this vendor
    const existing = await prisma.menuItem.findFirst({
      where: { name: item.name, vendorId: item.vendorId },
    });
    if (!existing) {
      await prisma.menuItem.create({ data: item });
      console.log(`✅ Created menu item: ${item.name}`);
    } else {
      console.log(`⏭️ Menu item already exists: ${item.name}`);
    }
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
