const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/prisma');

const server = app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(` SiapSiaga Server running on http://0.0.0.0:${env.PORT}`);
  console.log(` Environment: ${env.NODE_ENV}`);
  console.log(`===============================================`);
});

async function shutdown() {
  console.log('Menutup server SiapSiaga...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Server & DB terputus bersih.');
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
