import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * TokDig Seed Script
 * Run with: npx ts-node src/seeds/seed.ts
 * Requires PostgreSQL running via docker-compose
 */
async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'tokdig',
    password: 'tokdig_dev_2026',
    database: 'tokdig',
    synchronize: true,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  });

  await dataSource.initialize();
  console.log('📦 Connected to database');

  // ─── ADMIN USER ──────────────────────────────────────
  const usersRepo = dataSource.getRepository('User');
  const profilesRepo = dataSource.getRepository('UserProfile');

  const existingAdmin = await usersRepo.findOne({ where: { email: 'admin@tokdig.com' } });
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const admin = usersRepo.create({
      email: 'admin@tokdig.com',
      passwordHash: await bcrypt.hash('admin123', salt),
      role: 'superadmin',
      isActive: true,
      emailVerified: true,
    });
    const savedAdmin = await usersRepo.save(admin);
    await profilesRepo.save(
      profilesRepo.create({ userId: (savedAdmin as any).id, name: 'Admin TokDig' }),
    );
    console.log('✅ Admin user created (admin@tokdig.com / admin123)');
  } else {
    console.log('ℹ️  Admin already exists');
  }

  // ─── CATEGORIES ──────────────────────────────────────
  const catRepo = dataSource.getRepository('Category');

  const categories = [
    { name: 'AI Premium', slug: 'ai-premium', icon: '🤖', description: 'Akun premium AI tools seperti ChatGPT, Claude, Midjourney', sortOrder: 1 },
    { name: 'VPS', slug: 'vps', icon: '🖥️', description: 'Virtual Private Server dari berbagai provider', sortOrder: 2 },
    { name: 'Digital Account', slug: 'digital-account', icon: '👤', description: 'Akun premium streaming, kreativitas, dan produktivitas', sortOrder: 3 },
    { name: 'Jasa Web', slug: 'jasa-web', icon: '🌐', description: 'Layanan pembuatan dan pengembangan website', sortOrder: 4 },
    { name: 'Game Item', slug: 'game-item', icon: '🎮', description: 'Item, skin, dan top-up game populer', sortOrder: 5 },
    { name: 'Voucher', slug: 'voucher', icon: '🎫', description: 'Voucher game dan layanan digital', sortOrder: 6 },
  ];

  for (const cat of categories) {
    const existing = await catRepo.findOne({ where: { slug: cat.slug } });
    if (!existing) {
      await catRepo.save(catRepo.create(cat));
      console.log(`✅ Category created: ${cat.name}`);
    }
  }

  // ─── PRODUCTS ────────────────────────────────────────
  const productRepo = dataSource.getRepository('Product');
  const variantRepo = dataSource.getRepository('ProductVariant');
  const fieldRepo = dataSource.getRepository('ProductField');

  const aiCategory = await catRepo.findOne({ where: { slug: 'ai-premium' } });
  const vpsCategory = await catRepo.findOne({ where: { slug: 'vps' } });
  const digitalCategory = await catRepo.findOne({ where: { slug: 'digital-account' } });
  const gameCategory = await catRepo.findOne({ where: { slug: 'game-item' } });

  const products = [
    {
      name: 'ChatGPT Plus Premium',
      slug: 'chatgpt-plus-premium',
      categoryId: aiCategory?.id,
      description: 'Akses ChatGPT Plus dengan GPT-4o, GPT-4, DALL-E 3, dan fitur advanced. Cocok untuk profesional, developer, dan content creator yang butuh AI terbaik.',
      shortDesc: 'Akses ChatGPT Plus dengan GPT-4o dan semua fitur premium',
      type: 'ai_premium',
      fulfillmentType: 'semi_auto',
      basePrice: 120000,
      status: 'active',
      badges: ['best_seller', 'instant'],
      images: [],
      benefits: [
        'Akses GPT-4o dan GPT-4 tanpa batas',
        'DALL-E 3 untuk generate gambar',
        'Advanced Data Analysis',
        'Custom GPTs & GPT Store',
        'Priority access saat peak hours',
      ],
      howItWorks: [
        'Pilih paket dan lakukan pembayaran',
        'Kami kirim kredensial akun via dashboard',
        'Login dan mulai gunakan ChatGPT Plus',
      ],
      faq: [
        { question: 'Apakah ini akun shared?', answer: 'Tidak, ini akun private khusus untuk Anda.' },
        { question: 'Berapa lama proses pengiriman?', answer: 'Maksimal 1x24 jam setelah pembayaran dikonfirmasi.' },
        { question: 'Apakah ada garansi?', answer: 'Ya, garansi penuh selama masa aktif langganan.' },
      ],
      warrantyInfo: 'Garansi penuh selama masa aktif. Replacement gratis jika akun bermasalah.',
      slaText: 'Dikirim dalam 1-12 jam',
      isFeatured: true,
      totalSold: 245,
      sortOrder: 1,
      variants: [
        { name: '1 Bulan', durationDays: 30, price: 120000, originalPrice: 150000, isRecommended: false, sortOrder: 0 },
        { name: '3 Bulan', durationDays: 90, price: 320000, originalPrice: 450000, isRecommended: true, sortOrder: 1 },
        { name: '6 Bulan', durationDays: 180, price: 600000, originalPrice: 900000, isRecommended: false, sortOrder: 2 },
      ],
      fields: [
        { fieldName: 'email', fieldLabel: 'Email Anda', fieldType: 'email', isRequired: true, placeholder: 'email@contoh.com', sortOrder: 0 },
      ],
    },
    {
      name: 'Claude Pro by Anthropic',
      slug: 'claude-pro-anthropic',
      categoryId: aiCategory?.id,
      description: 'Claude Pro memberikan akses ke Claude 3.5 Sonnet dan Claude 3 Opus. AI paling aman dan akurat untuk tugas-tugas kompleks.',
      shortDesc: 'AI asisten terbaik dari Anthropic dengan Claude 3.5 Sonnet',
      type: 'ai_premium',
      fulfillmentType: 'semi_auto',
      basePrice: 130000,
      status: 'active',
      badges: ['new', 'instant'],
      images: [],
      benefits: [
        'Claude 3.5 Sonnet — model terbaik Anthropic',
        'Claude 3 Opus untuk analisis mendalam',
        'Priority access dan kecepatan lebih tinggi',
        '200K context window',
        'Upload file dan analisis dokumen',
      ],
      howItWorks: [
        'Pilih paket dan bayar',
        'Terima kredensial via dashboard',
        'Mulai gunakan Claude Pro',
      ],
      faq: [
        { question: 'Bisa dipakai untuk coding?', answer: 'Sangat bisa! Claude sangat bagus untuk programming.' },
      ],
      warrantyInfo: 'Garansi penuh selama masa aktif.',
      slaText: 'Dikirim dalam 1-12 jam',
      isFeatured: true,
      totalSold: 128,
      sortOrder: 2,
      variants: [
        { name: '1 Bulan', durationDays: 30, price: 130000, originalPrice: 160000, isRecommended: false, sortOrder: 0 },
        { name: '3 Bulan', durationDays: 90, price: 350000, originalPrice: 480000, isRecommended: true, sortOrder: 1 },
      ],
      fields: [
        { fieldName: 'email', fieldLabel: 'Email Anda', fieldType: 'email', isRequired: true, placeholder: 'email@contoh.com', sortOrder: 0 },
      ],
    },
    {
      name: 'VPS Basic — 2GB RAM',
      slug: 'vps-basic-2gb',
      categoryId: vpsCategory?.id,
      description: 'VPS murah dengan performa stabil. Cocok untuk website kecil, bot Discord, atau project personal.',
      shortDesc: 'VPS 2GB RAM dengan SSD dan uptime 99.9%',
      type: 'vps',
      fulfillmentType: 'manual',
      basePrice: 40000,
      status: 'active',
      badges: [],
      images: [],
      benefits: ['2 vCPU Core', '2GB RAM DDR4', '40GB SSD NVMe', 'Bandwidth 1TB', 'Uptime 99.9%'],
      howItWorks: [
        'Pilih OS dan bayar',
        'Kami setup VPS dalam 1-6 jam',
        'Terima akses root via dashboard',
      ],
      faq: [
        { question: 'Bisa pilih lokasi server?', answer: 'Saat ini tersedia di region Singapore dan Jakarta.' },
      ],
      warrantyInfo: 'Garansi uptime 99.9%. Refund jika server down >24 jam.',
      slaText: 'Setup dalam 1-6 jam',
      isFeatured: false,
      totalSold: 67,
      sortOrder: 1,
      variants: [
        { name: '1 Bulan', durationDays: 30, price: 40000, isRecommended: false, sortOrder: 0 },
        { name: '3 Bulan', durationDays: 90, price: 108000, originalPrice: 120000, isRecommended: true, sortOrder: 1 },
        { name: '12 Bulan', durationDays: 365, price: 384000, originalPrice: 480000, isRecommended: false, sortOrder: 2 },
      ],
      fields: [
        { fieldName: 'os', fieldLabel: 'Sistem Operasi', fieldType: 'select', options: ['Ubuntu 22.04', 'Ubuntu 24.04', 'CentOS 9', 'Debian 12'], isRequired: true, sortOrder: 0 },
        { fieldName: 'hostname', fieldLabel: 'Hostname', fieldType: 'text', isRequired: false, placeholder: 'contoh: my-server', sortOrder: 1 },
      ],
    },
    {
      name: 'Netflix Premium',
      slug: 'netflix-premium',
      categoryId: digitalCategory?.id,
      description: 'Akun Netflix Premium untuk streaming film dan series kualitas 4K. Private account, bukan sharing.',
      shortDesc: 'Akun Netflix Premium private — streaming 4K unlimited',
      type: 'digital_account',
      fulfillmentType: 'semi_auto',
      basePrice: 45000,
      status: 'active',
      badges: ['best_seller'],
      images: [],
      benefits: ['Kualitas 4K Ultra HD', 'Akun private (bukan sharing)', 'Bisa ganti profil dan password', 'Akses semua konten global'],
      warrantyInfo: 'Garansi 30 hari full replacement.',
      slaText: 'Dikirim dalam 1-6 jam',
      isFeatured: true,
      totalSold: 412,
      sortOrder: 1,
      variants: [
        { name: '1 Bulan', durationDays: 30, price: 45000, originalPrice: 65000, isRecommended: true, sortOrder: 0 },
      ],
      fields: [],
    },
    {
      name: 'Mobile Legends Diamond',
      slug: 'mobile-legends-diamond',
      categoryId: gameCategory?.id,
      description: 'Top up diamond Mobile Legends dengan harga termurah. Proses cepat dan aman.',
      shortDesc: 'Top up ML diamond murah & cepat',
      type: 'game_item',
      fulfillmentType: 'auto',
      basePrice: 12000,
      status: 'active',
      badges: ['instant'],
      images: [],
      benefits: ['Proses otomatis & instan', 'Harga termurah', 'Aman 100%'],
      warrantyInfo: 'Jika diamond tidak masuk dalam 15 menit, hubungi CS.',
      slaText: 'Instan (1-5 menit)',
      isFeatured: false,
      totalSold: 1830,
      sortOrder: 1,
      variants: [
        { name: '86 Diamond', price: 12000, isRecommended: false, sortOrder: 0 },
        { name: '172 Diamond', price: 23000, isRecommended: false, sortOrder: 1 },
        { name: '344 Diamond', price: 45000, isRecommended: true, sortOrder: 2 },
        { name: '706 Diamond', price: 88000, isRecommended: false, sortOrder: 3 },
      ],
      fields: [
        { fieldName: 'user_id', fieldLabel: 'User ID', fieldType: 'text', isRequired: true, placeholder: '12345678', sortOrder: 0 },
        { fieldName: 'zone_id', fieldLabel: 'Zone ID', fieldType: 'text', isRequired: true, placeholder: '1234', sortOrder: 1 },
      ],
    },
  ];

  for (const p of products) {
    const existing = await productRepo.findOne({ where: { slug: p.slug } });
    if (!existing) {
      const { variants, fields, ...productData } = p;
      const saved = await productRepo.save(productRepo.create(productData));
      const savedId = (saved as any).id;

      if (variants?.length) {
        for (const v of variants) {
          await variantRepo.save(variantRepo.create({ ...v, productId: savedId }));
        }
      }
      if (fields?.length) {
        for (const f of fields) {
          await fieldRepo.save(fieldRepo.create({ ...f, productId: savedId }));
        }
      }
      console.log(`✅ Product created: ${p.name}`);
    }
  }

  console.log('\n🎉 Seed completed!');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
