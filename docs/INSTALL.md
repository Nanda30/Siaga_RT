# Panduan Menjalankan SiapSiaga

## 1. Siapkan Database PostgreSQL
1. Buka Navicat Premium atau pgAdmin.
2. Buat database baru dengan nama: `siapsiaga`.
3. Buka folder `server/` dan buat file `.env` (bisa salin dari `.env.example`):
   ```env
   NODE_ENV=development
   PORT=4000
   DATABASE_URL="postgresql://postgres:PASSWORD_POSTGRES_ANDA@localhost:5432/siapsiaga?schema=public"
   JWT_SECRET=rahasia-siapsiaga-development-token-key-minimal-32-karakter
   JWT_EXPIRES_IN=7d
   CORS_ORIGINS=*
   LOG_LEVEL=info
   ```
4. Jalankan migrasi dan isi data awal (seed petugas & admin):
   ```bash
   cd server
   npm install
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```
5. Jalankan backend:
   ```bash
   npm run dev
   ```

---

## 2. Akun Awal yang Dibuat (Prisma Seed)
- **Ketua RW / Admin:** `081111111111` (Role: ADMIN)
- **Pos Satpam Utama:** `082222222222` (Role: SATPAM)
- **Petugas Ronda Malam:** `083333333333` (Role: SATPAM)
- **Warga Contoh:** `081234567890` (Role: WARGA)

*Catatan: Setiap nomor baru yang login otomatis terdaftar sebagai WARGA.*

---

## 3. Jalankan Aplikasi Mobile (Dev)
```bash
npm install
npx expo start
```
Buka Expo Go di HP atau Emulator.

---

## 4. Cara Download & Pasang Langsung ke HP (Tanpa Play Store)
Untuk menghasilkan file `.apk` yang bisa langsung dikirim via link/WhatsApp atau di-download langsung ke HP:
1. Login akun Expo di terminal:
   ```bash
   npx eas-cli login
   ```
2. Jalankan build APK:
   ```bash
   npx eas-cli build -p android --profile preview
   ```
3. Tunggu proses build cloud selesai (sekitar 5-10 menit).
4. Terminal akan memberikan **Link URL Download APK** & **QR Code**. Buka link tersebut di HP dan instal aplikasi.
