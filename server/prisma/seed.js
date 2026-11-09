const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial SiapSiaga users...');

  // Admin
  const admin = await prisma.user.upsert({
    where: { phone: '6281111111111' },
    update: { role: 'ADMIN', name: 'Ketua RW / Admin' },
    create: {
      phone: '6281111111111',
      name: 'Ketua RW / Admin',
      role: 'ADMIN',
    },
  });

  // Satpam 1 & 2
  const satpam1 = await prisma.user.upsert({
    where: { phone: '6282222222222' },
    update: { role: 'SATPAM', name: 'Pos Satpam Utama' },
    create: {
      phone: '6282222222222',
      name: 'Pos Satpam Utama',
      role: 'SATPAM',
    },
  });

  const satpam2 = await prisma.user.upsert({
    where: { phone: '6283333333333' },
    update: { role: 'SATPAM', name: 'Petugas Ronda Malam' },
    create: {
      phone: '6283333333333',
      name: 'Petugas Ronda Malam',
      role: 'SATPAM',
    },
  });

  // Sample Warga
  const warga1 = await prisma.user.upsert({
    where: { phone: '6281234567890' },
    update: { role: 'WARGA', name: 'Bapak Budi (RT 01)' },
    create: {
      phone: '6281234567890',
      name: 'Bapak Budi (RT 01)',
      role: 'WARGA',
    },
  });

  console.log('Seeding completed successfully!');
  console.log({ admin, satpam1, satpam2, warga1 });
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
