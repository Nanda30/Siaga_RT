# Rencana Refactor SiagaRW — Production Ready

Status: **RENCANA — belum dikerjakan.** Dokumen ini untuk direview dulu.
Dibuat: 2026-08-06

---

## 1. Konteks

Aplikasi saat ini (`SiagaRT`) adalah app Expo SDK 54 yang menulis langsung ke
Firebase Realtime Database dari client. Dua masalah membuatnya tidak bisa dipakai
di lingkungan nyata:

1. **Tidak berfungsi sekarang.** Semua write ditolak `permission_denied`. Rules
   RTDB menuntut `auth != null`, tapi app tidak punya sesi terautentikasi.
   Percobaan mengaktifkan Firebase Anonymous Auth gagal dengan
   `CONFIGURATION_NOT_FOUND` (service Auth belum di-provision di project).
2. **Tidak aman secara arsitektur.** `role` (Warga / Petugas) dipilih sendiri di
   client (`src/screens/LoginScreen.jsx:110-118`) lalu dipercaya apa adanya.
   Siapa pun bisa memilih "Petugas" dan membaca nama, nomor HP, dan koordinat
   GPS seluruh warga. Tidak ada lapisan server yang bisa menolak.

Karena itu database dipindah ke PostgreSQL di belakang REST API sendiri. Server
menjadi satu-satunya pihak yang menentukan role dan menegakkan akses. Firebase
tetap dipakai, tapi hanya untuk push notification (FCM).

Hasil akhir yang dituju: backend Node/Express + Prisma + PostgreSQL, app mobile
tanpa akses DB langsung, UI yang bisa dipakai warga usia 40+, offline-first,
dan siap dinaikkan ke Google Play tanpa ubah arsitektur.

---

## 2. Keputusan yang sudah disepakati

| Hal | Keputusan |
|---|---|
| Role & auth | **Seeded staff.** Nomor baru selalu jadi `WARGA`. Akun `SATPAM`/`ADMIN` hanya lewat Prisma seed atau Navicat. `role` dari client diabaikan total. |
| PostgreSQL dev | User install PostgreSQL sendiri (Navicat Premium sebagai manager). Saya siapkan `.env.example` + skrip migrasi. |
| Cara kerja | **Bertahap per fase.** Tiap fase bisa dites sebelum lanjut. |

### Keputusan yang masih terbuka

**Nama app.** Folder dan app sekarang `SiagaRT`, spec menyebut `SiagaRW`.
Rekomendasi: rename identitas app ke **SiagaRW** (`app.json` name/slug, judul di
UI, `android.package`), tapi folder root `C:\devnanda\SiagaRT` dibiarkan — rename
folder repo git berisiko dan tidak memberi manfaat. Perlu konfirmasi sebelum
Fase 0 dimulai.

---

## 3. Struktur project tujuan

Repo jadi monorepo dua paket. File mobile yang ada sekarang dipindah ke
`mobile/` (pakai `git mv` supaya riwayat file tetap terlacak).

```
SiagaRT/                     <- folder root tidak di-rename
  mobile/                    <- seluruh app Expo sekarang, dipindah ke sini
    App.js
    app.json
    babel.config.js
    index.js
    package.json
    assets/
    src/
      api/                   <- BARU: client REST + queue offline
      components/            <- yang ada, dipakai ulang
      context/               <- BARU: AuthContext, ThemeContext
      hooks/
      navigation/
      screens/
      services/
      theme/
      utils/                 <- BARU: format telepon, tanggal, dsb
  server/
    src/
      config/                <- env, logger, prisma client
      controllers/
      middleware/            <- auth JWT, role guard, error handler, rate limit
      repositories/          <- akses Prisma, dipanggil service
      routes/
      services/              <- logika bisnis
      utils/
      validation/            <- skema Zod
      app.js                 <- rakit Express, bisa diimpor untuk test
      server.js              <- entry point, listen
    prisma/
      schema.prisma
      seed.js
    package.json
    .env.example
  docs/
    README.md
    ERD.md
    API.md
    INSTALL.md
    DEPLOY.md
    STRUCTURE.md
```

Alasan `repositories/` ditambah di luar spec: spec minta lapisan `models/`, tapi
dengan Prisma tidak ada model class — yang setara adalah repository yang
membungkus Prisma Client supaya service tidak tahu detail ORM. Ini yang membuat
pindah dari PostgreSQL lokal ke server produksi tidak menyentuh service.

Alasan `app.js` dipisah dari `server.js`: supaya Express bisa diuji tanpa
membuka port.

---

## 4. Skema database

Database: `siagarw`. Semua lewat Prisma Migrate — tidak ada SQL manual.

```prisma
enum Role     { ADMIN SATPAM WARGA }
enum AlertType   { EMERGENCY CAUTION }
enum AlertStatus { PENDING RESPONDING COMPLETED }

model User {
  id        String   @id @default(uuid())
  name      String
  phone     String   @unique          // disimpan ternormalisasi: 62xxxxxxxxxx
  role      Role     @default(WARGA)
  isActive  Boolean  @default(true)
  fcmToken  String?                    // device token untuk push
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  alerts        Alert[]
  notifications Notification[]
  activityLogs  ActivityLog[]
  handledAlerts Alert[] @relation("HandledBy")
}

model Alert {
  id        String      @id @default(uuid())
  userId    String
  type      AlertType
  message   String?
  latitude  Float
  longitude Float
  address   String?
  status    AlertStatus @default(PENDING)
  handledById String?                  // petugas yang menangani
  clientId  String?     @unique        // idempotensi sync offline
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  user      User @relation(fields: [userId], references: [id])
  handledBy User? @relation("HandledBy", fields: [handledById], references: [id])

  @@index([status, createdAt])
  @@index([userId, createdAt])
}

model Notification {
  id        String   @id @default(uuid())
  userId    String
  title     String
  body      String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
  @@index([userId, isRead])
}

model ActivityLog {
  id          String   @id @default(uuid())
  userId      String?
  action      String
  description String?
  createdAt   DateTime @default(now())

  user User? @relation(fields: [userId], references: [id])
  @@index([createdAt])
}
```

Tambahan di luar spec, dengan alasan:

- `clientId` di `Alert` — **wajib** untuk offline queue. Tanpa ini, satu laporan
  yang gagal kirim lalu di-retry akan masuk dua kali. UUID dibuat di device,
  `@unique` di server menolak duplikat.
- `handledById` — dashboard perlu tahu petugas mana yang menangani; spec minta
  dashboard "jauh lebih informatif".
- `fcmToken` di `User` — push notification butuh tempat menyimpan device token.
- `isActive` — supaya akun petugas bisa dinonaktifkan tanpa dihapus (`DELETE`
  jadi soft delete; menghapus user akan ikut menghapus riwayat alert-nya).
- `phone` ternormalisasi ke format `62xxxxxxxxxx` — supaya `0897...` dan
  `+62897...` tidak jadi dua akun berbeda. Ini bug nyata pada kode sekarang
  (`LoginScreen.jsx:51` hanya membuang non-digit).
- `ActivityLog.userId` nullable — login gagal juga perlu dicatat, saat itu belum
  ada user.

Timestamp: satu format saja, ISO 8601 UTC di seluruh API. Kode sekarang campur
epoch ms (`UserHomeScreen.jsx:59` `serverTimestamp()`) dan ISO string
(`AlertDetailScreen.jsx:64`) pada nama field yang sama.

---

## 5. Autentikasi & login

Flow sesuai spec, dengan satu perbedaan penting: **server menentukan role.**

```
Nama + Nomor HP + (role dari UI, hanya untuk tampilan)
        |
POST /api/auth/login
        |
normalisasi nomor -> 62xxxxxxxxxx
        |
cari user by phone
        |
   +----+----+
   |         |
tidak ada   sudah ada
   |         |
buat user   ambil role
role=WARGA  dari DB
   |         |
   +----+----+
        |
generate JWT { sub, role, name }
        |
respons { token, user }
```

Yang berubah dari spec: field `role` yang dikirim client **diabaikan**. Kalau
nomor baru, role selalu `WARGA`. Kalau nomor sudah ada, role diambil dari DB.
Petugas dibuat lewat `prisma/seed.js` atau langsung di Navicat.

Konsekuensi di UI: `SegmentedButtons` pilih peran di layar login dihapus. Setelah
login, app membaca `user.role` dari respons untuk memutuskan tujuan navigasi.
Ini juga menghilangkan kebingungan — warga tidak lagi melihat pilihan "Petugas"
yang bukan haknya.

JWT: HS256, `expiresIn` 7 hari, secret dari `JWT_SECRET` di `.env`. Disimpan di
`expo-secure-store` (bukan AsyncStorage — token adalah kredensial). Ada helper
`ensureValidSession()` yang memeriksa masa berlaku token secara lokal sebelum
request; kalau habis, user diarahkan ke layar login.

bcrypt: spec menyebut bcrypt. Dengan login tanpa password, bcrypt tidak dipakai
untuk user biasa. Tetap dipasang dan dipakai untuk **hash `clientId` idempotensi
bukan** — dipakai kalau nanti akun ADMIN diberi password untuk panel web. Saya
akan pasang dependency-nya dan menyediakan kolom `passwordHash String?` opsional
di `User`, tapi tidak mengaktifkan alur password di fase ini. Alternatifnya:
tidak memasang bcrypt sama sekali sampai dibutuhkan. **Perlu keputusan** — lihat
§12.

Middleware:

- `authenticate` — verifikasi `Authorization: Bearer <token>`, tempel
  `req.user = { id, role }`.
- `authorize(...roles)` — tolak `403` kalau role tidak cocok.
- Aturan akses: `WARGA` hanya boleh melihat alert miliknya sendiri.
  `SATPAM` boleh melihat semua alert dan mengubah status. `ADMIN` boleh CRUD user.

---

## 6. REST API

Semua respons memakai satu bentuk, sesuai spec:

```json
{ "status": "success", "message": "...", "data": {}, "error": null }
```

Perbedaan dari spec: prefix endpoint auth jadi `/api/auth/login` (bukan
`/api/login`) supaya sejalan dengan pengelompokan route lain. Kalau kamu mau
tetap `/api/login`, saya sediakan alias.

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| POST | `/api/auth/login` | publik | login / registrasi otomatis |
| GET | `/api/auth/me` | login | profil sesi sekarang |
| POST | `/api/auth/fcm-token` | login | simpan device token untuk push |
| GET | `/api/users` | ADMIN | daftar, paginasi |
| GET | `/api/users/:id` | ADMIN, atau diri sendiri | |
| POST | `/api/users` | ADMIN | buat petugas |
| PUT | `/api/users/:id` | ADMIN, atau diri sendiri (nama saja) | |
| DELETE | `/api/users/:id` | ADMIN | soft delete, `isActive=false` |
| GET | `/api/alerts` | login | WARGA: milik sendiri. SATPAM/ADMIN: semua. Query: `status`, `type`, `search`, `page`, `limit`, `from`, `to` |
| GET | `/api/alerts/:id` | pemilik atau SATPAM/ADMIN | |
| POST | `/api/alerts` | login | terima `clientId` untuk idempotensi |
| PUT | `/api/alerts/:id` | SATPAM/ADMIN | ubah status |
| DELETE | `/api/alerts/:id` | ADMIN | |
| GET | `/api/dashboard` | SATPAM, ADMIN | ringkasan + grafik + 10 terbaru |
| GET | `/api/notifications` | login | milik sendiri |
| POST | `/api/notifications` | ADMIN, SATPAM | kirim ke user / broadcast |
| PATCH | `/api/notifications/:id/read` | pemilik | tandai sudah dibaca |
| GET | `/api/health` | publik | untuk cek koneksi dari app |

`GET /api/dashboard` mengembalikan dalam satu panggilan:

```json
{
  "counts":  { "pending": 0, "responding": 0, "completed": 0, "total": 0 },
  "periods": { "today": 0, "week": 0, "month": 0 },
  "chart":   [ { "date": "2026-08-01", "emergency": 0, "caution": 0 } ],
  "recent":  [ /* 10 alert terbaru */ ]
}
```

Dihitung dengan `prisma.alert.groupBy` — bukan mengambil semua baris lalu
menghitung di JavaScript. Kode dashboard sekarang mengambil seluruh koleksi dan
memfilter di client (`AdminDashboardScreen.jsx:57-61`), yang akan berat begitu
data bertambah.

Endpoint `/api/health` ditambah di luar spec: dipakai app untuk membedakan
"server mati" dari "internet mati". Ini mengganti `useNetworkStatus` yang
sekarang bergantung pada `.info/connected` milik Firebase.

Realtime refresh dashboard: memakai polling (`useFocusEffect` + interval 15 detik
+ pull-to-refresh), bukan WebSocket. Alasan: polling cukup untuk skala satu RW,
tidak menambah dependensi, dan tetap jalan lewat proxy/jaringan terbatas.
Kalau nanti butuh instan, tinggal tambah Socket.io tanpa ubah struktur.

---

## 7. Keamanan & operasional server

- `helmet()` — header keamanan.
- `cors` — whitelist dari `CORS_ORIGINS` di env; di dev izinkan semua.
- `express-rate-limit` — global 100 req / 15 menit per IP; khusus
  `/api/auth/login` 10 req / 15 menit (mencegah enumerasi nomor HP);
  khusus `POST /api/alerts` 20 / menit (tetap longgar, ini tombol darurat —
  membatasi terlalu ketat berbahaya).
- Zod di setiap route yang menerima input, lewat middleware `validate(schema)`.
- Winston: dua transport — `logs/error.log` dan `logs/combined.log`, plus
  console berwarna di dev. `morgan` dialirkan ke Winston untuk log request.
  Field sensitif (token, nomor HP lengkap) di-mask di log.
- Global error handler: satu-satunya tempat yang membentuk respons error.
  Kelas `AppError` untuk error yang disengaja; error Prisma dipetakan ke
  HTTP status yang benar (`P2002` -> 409, `P2025` -> 404).
- `dotenv` — semua konfigurasi dari env, divalidasi dengan Zod saat boot.
  Server menolak start kalau `JWT_SECRET` kosong atau memakai nilai contoh.
- Graceful shutdown: `SIGTERM`/`SIGINT` menutup HTTP server lalu
  `prisma.$disconnect()`.

`.env.example` (nilai asli tidak masuk git):

```
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/siagarw?schema=public"
JWT_SECRET=ganti-dengan-string-acak-minimal-32-karakter
JWT_EXPIRES_IN=7d
CORS_ORIGINS=*
LOG_LEVEL=info
FCM_PROJECT_ID=siagart-131d3
FCM_SERVICE_ACCOUNT_PATH=./secrets/fcm-service-account.json
```

Catatan: `.gitignore` sekarang hanya mengabaikan `.env*.local`, jadi file `.env`
biasa **akan** ikut ter-commit. Ini diperbaiki di Fase 0 — ditambah `.env`,
`server/logs/`, `server/secrets/`.

---

## 8. Sisi mobile

### 8.1 Lapisan API & offline-first

Modul baru di `mobile/src/api/`:

- `client.js` — wrapper `fetch` dengan base URL, timeout (15 detik pakai
  `AbortController`), penyisipan header `Authorization`, dan pembongkaran
  bentuk respons `{status, message, data, error}` jadi nilai / throw `ApiError`.
- `baseUrl.js` — menentukan alamat server. Di dev, host dibaca dari
  `Constants.expoConfig.hostUri` (`expo-constants`) lalu port diganti jadi
  `4000`, sehingga app di HP fisik otomatis menemukan laptop tanpa hardcode IP.
  Di produksi memakai `extra.apiUrl` dari `app.json`.
- `endpoints/` — `auth.js`, `alerts.js`, `users.js`, `dashboard.js`,
  `notifications.js`. Tipis, hanya memanggil `client`.
- `queue.js` — antrean offline di AsyncStorage.

Alur offline (spec dipertahankan, ditambah idempotensi):

```
kirim laporan
      |
buat clientId (UUID di device)
      |
coba POST /api/alerts
      |
  +---+---+
  |       |
sukses  gagal / offline
  |       |
selesai simpan ke AsyncStorage
        (kunci: siagarw:alert_queue)
          |
      NetInfo mendeteksi online
          |
      kirim ulang berurutan
          |
      server tolak duplikat via clientId unik
          |
      hapus dari antrean
```

Penting: laporan yang masih di antrean **tetap ditampilkan** di daftar milik
warga dengan badge "Menunggu terkirim", supaya user tahu laporannya belum sampai.
Kalau tidak, warga bisa mengira laporan darurat sudah diterima padahal belum.

Retry: percobaan ulang dengan jeda bertambah (1s, 2s, 4s, maks 5 kali) lalu
menunggu event online berikutnya. Tidak retry tanpa batas.

Dependency baru yang dipasang lewat `npx expo install`:
`@react-native-async-storage/async-storage` (2.2.0), `expo-secure-store`
(~15.0.8), `@react-native-community/netinfo`, `expo-crypto` atau `react-native-uuid`
untuk UUID, `@expo-google-fonts/inter`.

`useNetworkStatus` diubah: sekarang bergantung pada `.info/connected` Firebase
(`src/hooks/useNetworkStatus.js:14`). Diganti gabungan NetInfo (ada koneksi
perangkat?) + ping `/api/health` (server terjangkau?). Dua kondisi ini berbeda
dan keduanya perlu ditampilkan.

### 8.2 Context

- `AuthContext` — menyimpan `user`, `token`, `login()`, `logout()`,
  `isLoading`. Membaca token dari SecureStore saat app dibuka, sehingga user
  tidak perlu login ulang setiap kali. Ini fitur baru: sekarang sesi hilang
  begitu app ditutup karena hanya disimpan di `route.params`.
- `ThemeContext` — mode `light` / `dark` / `system`, disimpan di AsyncStorage.
- `SyncContext` — status antrean offline, jumlah pending, trigger sync manual.

Navigasi jadi dua stack terpisah berdasarkan status login (`AuthStack` vs
`AppStack`), bukan satu stack dengan `navigation.replace`. Ini memperbaiki cacat
sekarang: `LogoutAction.jsx:15` hanya me-reset navigasi tanpa membuang sesi.

### 8.3 Redesign UI

Yang dipertahankan: seluruh 15 komponen di `src/components/` sudah presentasional
murni dan tidak menyentuh Firebase — dipakai ulang, hanya ditambah dukungan tema
gelap. Token desain di `src/theme/` (`spacing`, `radius`, `elevation`,
`typography`, `colors`) juga dipertahankan.

Perubahan konkret:

**Header warga — dibuat compact.** Sekarang kartu sambutan tinggi dengan ikon 44px
dan jam ukuran `screenTitle` (`UserHomeScreen.jsx:81-95`). Diubah jadi satu baris
padat: nama + jam + tanggal di kiri, deretan indikator (GPS, internet, tema,
logout) di kanan sebagai ikon. Target tinggi sekitar setengah dari sekarang.

**Tombol Darurat & Siaga — jadi fokus halaman.** Sekarang berupa kartu horizontal
(`AlertButton.jsx`). Diubah jadi dua tombol bulat besar berdampingan, diameter
mengikuti lebar layar (sekitar 42% lebar, dibatasi 150–190px), merah terang dan
kuning, dengan shadow. Tombol Darurat diberi animasi pulse memakai
react-native-reanimated (`withRepeat` + `withTiming` pada `scale`) — library ini
sudah ada di `package.json` tapi belum dipakai sama sekali.

**Petunjuk Darurat — jadi collapsible.** Sekarang selalu terbuka dan memakan
ruang besar (`UserHomeScreen.jsx:128-135`). Diubah jadi baris "Petunjuk Darurat"
dengan ikon panah yang berputar; isinya expand/collapse dengan animasi
Reanimated (`Layout` animation), bukan `LayoutAnimation` — karena New Architecture
aktif (`app.json` `newArchEnabled: true`) dan perilaku `LayoutAnimation` di New
Arch tidak dijamin oleh dokumentasi.

**Tombol Back di semua halaman.** Sekarang `AppNavigator.jsx:37,47` memakai
`headerLeft: () => null` untuk menyembunyikan back di layar home. Diubah:
layar home tetap tanpa back (memang benar — back di home akan keluar aplikasi),
tapi diberi tombol logout yang jelas; layar Detail Laporan dan semua layar baru
mendapat back yang benar memakai `headerBackVisible` (bentuk idiomatik
native-stack v7), bukan `headerLeft: () => null`.

**Dashboard petugas — lebih informatif.** Enam kartu ringkasan (pending,
responding, completed, hari ini, minggu ini, bulan ini), grafik batang 7 hari
terakhir, daftar 10 terbaru, filter, pencarian, pull-to-refresh. Data dari satu
panggilan `GET /api/dashboard`.

**Aksi cepat petugas** di layar detail: tombol Telepon (`tel:`), WhatsApp
(`https://wa.me/62...`), dan Navigasi Google Maps. Nomor dinormalisasi ke format
Indonesia lewat helper baru `mobile/src/utils/phone.js` — dipakai bersama oleh
tombol telepon dan WhatsApp.

**Tema gelap.** `theme.js` sekarang hanya `MD3LightTheme`. Ditambah `colorsDark`
dan `MD3DarkTheme`, lalu semua komponen mengambil warna lewat hook `useAppTheme()`
alih-alih mengimpor `colors` statis. Ini perubahan yang menyentuh banyak file
tapi mekanis dan berulang — satu pola diterapkan ke 15 komponen + 4 layar.

**Tipografi.** Skala diubah ke angka spec: title 28, section 22, subtitle 18,
body 16, caption 14, button 16 bold (sekarang 26 / 20 / — / 16 / 14 / 17 di
`typography.js:3-9`). Font Inter dimuat lewat `@expo-google-fonts/inter` +
`useFonts`. Catatan: config plugin `expo-font` lebih efisien tapi butuh dev build
dan tidak jalan di Expo Go — jadi memakai `useFonts` dulu, pindah ke config
plugin saat masuk EAS Build di Fase 4.

Aksesibilitas: `accessibilityRole` dan `accessibilityLabel` pada semua elemen yang
bisa ditekan (chip filter di `AdminDashboardScreen.jsx:128-133` sekarang berupa
`<Text onPress>` tanpa peran), target sentuh minimal 48px (`TOUCH_TARGET` sudah
ada di `spacing.js:13`), dan kontras teks diuji terhadap WCAG AA.

---

## 9. Push notification (FCM)

Ini satu-satunya bagian Firebase yang tetap dipakai. Yang dihapus:
`firebase/app`, `firebase/database`, `firebase/auth`, file
`src/services/firebase.js`, dan `database.rules.json`.

Alur: warga kirim laporan -> server simpan ke PostgreSQL -> server buat baris
`Notification` -> server kirim FCM ke semua `fcmToken` milik user berrole
`SATPAM`/`ADMIN`. Riwayat notifikasi tetap di PostgreSQL; FCM hanya kurir.

Yang perlu dari dokumentasi Expo SDK 54 (sudah diverifikasi):

- Push jarak jauh **tidak jalan di Expo Go pada Android** sejak SDK 53. Jadi
  pengujian push wajib memakai development build (`eas build --profile development`),
  bukan Expo Go. Fitur lain tetap bisa dites di Expo Go.
- `google-services.json` diperlukan dan didaftarkan lewat
  `app.json` -> `android.googleServicesFile`. File ini harus masuk `.gitignore`.
- Dua jalur pengiriman: lewat Expo Push Service (`getExpoPushTokenAsync`, butuh
  `extra.eas.projectId`) atau langsung ke FCM v1 (`getDevicePushTokenAsync` +
  service account, endpoint `https://fcm.googleapis.com/v1/projects/<id>/messages:send`).
  **Rencana: jalur Expo Push Service.** Alasan: lebih sedikit kredensial yang
  disimpan di server, dan `services/notifications.js:54` sudah memakai
  `getExpoPushTokenAsync` dengan `projectId`. Spec meminta "FCM" — Expo Push
  Service memang mengirim lewat FCM di belakang layar, jadi ini tetap memenuhi.
  Kalau kamu mau server bicara langsung ke FCM, itu keputusan di §12.

`app.json` saat ini belum punya `android.package`, `extra.eas.projectId`, maupun
`googleServicesFile` — ketiganya ditambahkan di Fase 4.

---

## 10. Perbaikan bug yang sudah teridentifikasi

Ditemukan saat pemeriksaan kode, akan dibereskan di fase yang sesuai:

| Temuan | Lokasi | Fase |
|---|---|---|
| Write RTDB selalu `permission_denied` | seluruh app | 2 (hilang saat pindah ke REST) |
| Role dipercaya dari client | `LoginScreen.jsx:110-118` | 1 & 2 |
| Nomor HP tidak dinormalisasi, `0897` vs `+62897` jadi dua akun | `LoginScreen.jsx:51` | 1 |
| Dua format timestamp pada nama field sama | `UserHomeScreen.jsx:59` vs `AlertDetailScreen.jsx:64` | 1 |
| `DangerButton.jsx` tidak dipakai sama sekali (dead file) | `src/components/DangerButton.jsx` | 3 — dihapus atau dipakai |
| `TOUCH_TARGET` diimpor tapi tidak dipakai | `DangerButton.jsx:8` | 3 |
| `const { base, on }` — `on` tidak dipakai | `AlertDetailScreen.jsx:53` | 3 |
| `orderByChild` sia-sia karena `.val()` membuang urutan | `AdminDashboardScreen.jsx:38,42-44` | 2 (hilang) |
| Filter chip berupa `<Text onPress>`, tanpa peran aksesibilitas | `AdminDashboardScreen.jsx:128-133` | 3 |
| `FlatList` horizontal di dalam `ListHeaderComponent` `FlatList` | `AdminDashboardScreen.jsx:119` | 3 |
| `withAlpha()` pecah kalau diberi warna `rgba()` | `StatusBadge.jsx:16` | 3 |
| Tiga cara berbeda memberi alpha pada warna | `StatusBadge.jsx:28`, `StatusChip.jsx:17` | 3 — satukan jadi helper |
| Logout tidak membuang sesi (belum ada sesi untuk dibuang) | `LogoutAction.jsx:13-16` | 2 |
| `headerLeft: () => null` bukan bentuk idiomatik | `AppNavigator.jsx:37,47` | 3 |
| `theme.js:5-9` barrel re-export tidak dipakai siapa pun | `src/theme/theme.js` | 3 |
| `babel.config.js` mendaftarkan `react-native-worklets/plugin` manual padahal `babel-preset-expo` sudah mengaturnya | `babel.config.js` | 0 |
| `.env` tidak masuk `.gitignore` (hanya `.env*.local`) | `.gitignore` | 0 |
| `README.md` isinya satu baris `"# SiagaRT"` termasuk tanda kutip | `README.md` | 4 |
| API key Firebase ter-commit | `src/services/firebase.js:5` | 2 (file dihapus) |

Catatan: API key Firebase Web memang tidak rahasia menurut desain Firebase, tapi
karena file itu dihapus seluruhnya, isu ini hilang sendiri. Kalau nanti FCM
memerlukan config Firebase di mobile, yang dipakai adalah `google-services.json`
yang di-gitignore, bukan key di dalam kode.

Pemeriksaan API deprecated: `services/notifications.js:6-13` sudah memakai
`shouldShowBanner`/`shouldShowList` (pengganti `shouldShowAlert`) dan sudah
melewatkan `projectId`. Tidak ada `expo-permissions`. Bagian ini bersih.

---

## 11. Fase pengerjaan

Tiap fase berhenti di titik yang bisa kamu tes sendiri.

### Fase 0 — Persiapan (kecil, tidak menyentuh fitur)

1. Konfirmasi nama app (SiagaRW vs SiagaRT).
2. Kamu install PostgreSQL 17 + buat database `siagarw`, lalu beri saya
   kredensialnya (atau isi `.env` sendiri dari `.env.example`).
3. `git mv` file mobile ke `mobile/`, buat kerangka `server/` dan `docs/`.
4. Perbaiki `.gitignore` (`.env`, `server/logs/`, `server/secrets/`,
   `google-services.json`).
5. Bersihkan `babel.config.js`.

**Bisa dites:** `cd mobile && npx expo start` masih jalan seperti sebelumnya
(masih pakai Firebase, belum berubah fungsinya).

### Fase 1 — Backend + database

Prisma schema, migrasi, seed (1 ADMIN + 2 SATPAM + beberapa WARGA + alert contoh),
seluruh route, controller, service, repository, validasi Zod, middleware, Winston,
error handler.

**Bisa dites:** `cd server && npm run dev`, lalu uji lewat curl / Postman.
Saya sediakan `docs/API.md` berisi contoh curl untuk setiap endpoint, plus
file `server/test.http` supaya bisa diklik langsung dari VS Code REST Client.
Data bisa dilihat di Navicat.

### Fase 2 — Mobile pindah ke REST API

Lapisan `api/`, `AuthContext`, SecureStore, antrean offline, dua stack navigasi,
keempat layar dialihkan dari Firebase ke REST, hapus semua kode Firebase kecuali
notifikasi.

**Bisa dites:** login, kirim laporan, lihat di dashboard petugas, ubah status,
matikan Wi-Fi lalu kirim laporan dan nyalakan lagi untuk melihat auto-sync.
Semua data muncul di Navicat.

### Fase 3 — Redesign UI/UX

Header compact, tombol bulat besar + pulse, petunjuk collapsible, dashboard
informatif + grafik, tema gelap, font Inter, tipografi spec, aksesibilitas,
aksi telepon/WhatsApp/navigasi, pembersihan semua temuan di §10.

**Bisa dites:** buka app, periksa tampilan terang dan gelap, coba dengan ukuran
font sistem diperbesar.

### Fase 4 — FCM, dokumentasi, siap Play Store

Integrasi push, `android.package`, `versionCode`, `eas.json`, dokumentasi
lengkap Bahasa Indonesia di `docs/`.

**Bisa dites:** `eas build --profile preview --platform android`, install APK
di HP, kirim laporan dari satu HP dan terima notifikasi di HP petugas.

---

## 12. Yang perlu keputusan kamu sebelum mulai

1. **Nama app** — SiagaRW (rename identitas app, folder tetap) atau SiagaRT?
2. **bcrypt & password ADMIN** — pasang sekarang dengan kolom `passwordHash`
   opsional yang belum aktif, atau tunda sampai benar-benar dibutuhkan?
   Rekomendasi saya: tunda. Memasang dependency yang tidak dipakai menambah
   permukaan tanpa manfaat, dan menambahkannya nanti hanya butuh satu migrasi.
3. **Jalur push** — Expo Push Service (rekomendasi, lebih sederhana) atau server
   bicara langsung ke FCM v1 API?
4. **Alias `/api/login`** — perlu disediakan selain `/api/auth/login`?

---

## 13. Catatan verifikasi

Fakta Expo SDK 54 di dokumen ini diambil dari dokumentasi resmi versi v54.0.0,
bukan dari ingatan:

- AsyncStorage dipin ke `2.2.0`, `expo-secure-store` ke `~15.0.8` (dari
  `node_modules/expo/bundledNativeModules.json` — halaman dokumentasi tidak
  mencantumkan versi).
- Plugin babel Reanimated **tidak** perlu didaftarkan manual; sudah diatur oleh
  `babel-preset-expo`. Reanimated 4 hanya mendukung New Architecture.
- Push jarak jauh tidak tersedia di Expo Go Android sejak SDK 53.
- `Constants.expoConfig.hostUri` bertipe ada dan bisa dipakai membaca host dev
  server, meski dokumentasi tidak menjelaskan semantiknya secara naratif.
- `android.versionCode` tidak disebut sebagai wajib di halaman submit; EAS
  menangani lewat `eas.json`. Akan tetap diisi supaya eksplisit.
- Perilaku `LayoutAnimation` di bawah New Architecture tidak terdokumentasi —
  karena itu rencana memakai Reanimated untuk animasi collapse, bukan
  `LayoutAnimation`.

Hal yang belum bisa saya pastikan tanpa mencoba: apakah `google-services.json`
untuk project `siagart-131d3` sudah pernah dibuat, dan apakah ada akun Google
Play Developer. Keduanya di luar kode dan perlu kamu siapkan sebelum Fase 4.




