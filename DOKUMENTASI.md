# 📘 Dokumentasi Proyek SiagaRT (SiagaRW)

> Sistem Informasi Keamanan Warga berbasis mobile untuk pelaporan darurat lingkungan RW.

---

## 1. Ringkasan Proyek

**SiagaRW** adalah aplikasi mobile berbasis React Native (Expo) yang berfungsi sebagai sistem keamanan lingkungan rukun warga. Aplikasi memungkinkan:

- **Warga** melaporkan situasi **darurat** (mengancam jiwa) atau **siaga** (butuh perhatian) beserta lokasi GPS otomatis.
- **Petugas/Satpam** memantau laporan secara real-time, menghubungi pelapor, dan memperbarui status penanganan.

Aplikasi dirancang **offline-first**: tetap berfungsi tanpa internet, lalu menyinkronkan data secara otomatis saat koneksi tersedia.

| Atribut | Nilai |
|---|---|
| Nama Proyek | SiagaRW |
| Versi | 1.0.0 |
| Platform | Android, iOS, Web |
| Framework | React Native 0.81.5 (Expo 54) |
| Backend | Firebase Realtime Database |
| Bahasa UI | Indonesia |

---

## 2. Fitur Utama

### 2.1 Login Berbasis Peran
- Login hanya dengan **nama** dan **nomor telepon** (tanpa password).
- Pilih peran: **Warga** atau **Satpam** (Petugas).
- Validasi nomor minimal 10 digit.
- Sistem generate unique `userId` otomatis menggunakan `push()`.
- Data user disimpan langsung ke Realtime Database (tanpa Firebase Authentication).
- Mendukung login **offline** — data disimpan lokal, disinkronkan saat online.

### 2.2 Pelaporan Darurat (2 Jenis)
| Jenis | Warna | Keterangan |
|---|---|---|
| `DARURAT` (EMERGENCY) | 🔴 Merah | Situasi mengancam jiwa |
| `SIAGA` (CAUTION) | 🟡 Kuning | Butuh bantuan / waspada |

### 2.3 Pelacakan Lokasi GPS
- Koordinat latitude/longitude diambil otomatis saat laporan dikirim.
- Reverse geocoding menghasilkan alamat lengkap.
- Detail laporan menampilkan peta (react-native-maps / web fallback).
- Tombol "Buka di Google Maps" untuk navigasi.

### 2.4 Status Laporan Real-time
| Status | Arti | Warna Badge |
|---|---|---|
| `PENDING` | Menunggu ditangani | Merah |
| `RESPONDING` | Sedang diproses | Kuning |
| `COMPLETED` | Selesai | Hijau |

### 2.5 Komunikasi Langsung
- **WhatsApp** — chat dengan pelapor (nomor otomatis dinormalisasi ke format 62).
- **Telepon** — panggilan suara langsung.

### 2.6 Offline-First & Auto-Sync
- Data disimpan di AsyncStorage saat offline.
- Antrean operasi pending (`CREATE_USER`, `CREATE_ALERT`, `UPDATE_ALERT`).
- Sinkronisasi otomatis saat koneksi kembali.

### 2.7 Dark/Light Mode
- Toggle tema di header (komponen `ThemeToggle`).
- Palet warna lengkap untuk kedua tema.

### 2.8 Indikator Status Real-time
- **GPS**: aktif/mati.
- **Internet**: online/offline.
- **Jam**: jam & tanggal langsung berjalan.

---

## 3. Arsitektur & Struktur Folder

```
SiagaRT/
├── App.js                      # Root component
├── index.js                    # Entry point
├── app.json                    # Konfigurasi Expo
├── package.json                # Dependensi
├── assets/                     # Icon, splash, favicon
│
└── src/
    ├── screens/                # Layar aplikasi
    │   ├── LoginScreen.jsx          # Form login + pilih peran
    │   ├── UserHomeScreen.jsx       # Halaman utama warga
    │   ├── AdminDashboardScreen.jsx # Dasbor petugas
    │   └── AlertDetailScreen.jsx    # Detail laporan + update status
    │
    ├── navigation/
    │   └── AppNavigator.jsx    # Native Stack Navigation
    │
    ├── services/               # Logika bisnis & API
    │   ├── firebase.js         # Konfigurasi + auth anonim
    │   ├── localStorage.js     # Penyimpanan offline (AsyncStorage)
    │   ├── offlineSync.js      # Mekanisme sinkronisasi
    │   ├── location.js         # Layanan GPS
    │   └── notifications.js    # Notifikasi push
    │
    ├── components/             # Komponen UI reusable (16)
    │   ├── AlertButton.jsx     # Tombol DARURAT/SIAGA
    │   ├── AlertCard.jsx       # Kartu laporan
    │   ├── AppSnackbar.jsx     # Notifikasi bawah
    │   ├── ConfirmationDialog.jsx
    │   ├── PrimaryButton.jsx
    │   ├── DangerButton.jsx
    │   ├── StatusBadge.jsx     # Badge status
    │   ├── StatusChip.jsx      # Chip status GPS/Internet
    │   ├── InfoCard.jsx
    │   ├── EmptyState.jsx
    │   ├── LoadingOverlay.jsx
    │   ├── LogoutAction.jsx
    │   ├── SectionHeader.jsx
    │   ├── ThemeToggle.jsx     # Toggle dark/light
    │   ├── MapDisplay.native.jsx # Peta (native)
    │   └── MapDisplay.web.jsx    # Peta (web fallback)
    │
    ├── theme/                  # Design system
    │   ├── colors.js           # Palet warna light/dark
    │   ├── typography.js       # Skala tipografi
    │   ├── spacing.js          # Skala jarak
    │   ├── radius.js           # Radius sudut
    │   ├── elevation.js        # Shadow
    │   ├── theme.js            # Konfigurasi React Native Paper
    │   └── ThemeContext.js     # Context state tema
    │
    ├── hooks/                  # Custom hooks
    │   ├── useClock.js         # Jam real-time
    │   ├── useNetworkStatus.js # Status internet
    │   └── useLocationStatus.js# Status GPS
    │
    └── utils/                  # Fungsi bantu
```

---

## 4. Alur Kerja

### 4.1 Alur Warga

```
┌──────────────────┐
│   Login Screen   │
│  - Nama          │
│  - Nomor HP      │
│  - Role          │
└────────┬─────────┘
         ▼
    Validasi Input
         ▼
  Generate User ID
  (push().key)
         ▼
  Push ke Firebase RTDB
  users/{userId}
         ▼
   Simpan Berhasil
         ▼
  ┌──────┴──────┐
  ▼             ▼
Role=Warga  Role=Satpam
  ▼             ▼
UserHome    AdminDashboard
```

### 4.2 Alur Petugas

```
Login → AdminDashboard → (ringkasan PENDING/RESPONDING/COMPLETED)
     → Filter & Cari → Tap laporan → Detail
     → Lihat peta + kontak pelapor
     → WhatsApp / Telepon
     → Update status (PENDING → RESPONDING → COMPLETED)
```

### 4.3 Mekanisme Sinkronisasi Offline

```
1. Cek koneksi via useNetworkStatus
2. ONLINE  → Kirim langsung ke Firebase
3. OFFLINE → Simpan ke AsyncStorage
             + addPendingSync(operation)
4. Koneksi kembali → startAutoSync(true)
   → syncPendingOperations()
   → proses queue satu per satu
   → removePendingSync(id) jika sukses
   → setLastSync() timestamp
```

---

## 5. Struktur Data Firebase

```
siagart-131d3 (Realtime Database)
│
├── users/
│   └── <userId=auto-generated>
│       ├── userId: "auto-generated-push-id"
│       ├── name: "Budi Santoso"
│       ├── phone: "081234567890"
│       ├── role: "Warga" | "Satpam"
│       └── createdAt: serverTimestamp()
│
└── alerts/
    └── <alertId>
        ├── alertId: "auto-generated"
        ├── userId / userName / phone
        ├── type: "EMERGENCY" | "CAUTION"
        ├── message: "keterangan opsional"
        ├── latitude / longitude / address
        ├── status: "PENDING"|"RESPONDING"|"COMPLETED"
        ├── createdAt: serverTimestamp()
        └── updatedAt: ISO timestamp
```

**Catatan**: Tidak menggunakan Firebase Authentication. User ID di-generate otomatis oleh `push().key` Firebase Realtime Database.

---

## 6. Teknologi & Dependensi Utama

| Kategori | Library | Versi |
|---|---|---|
| Framework | expo | ~54.0.34 |
| UI | react-native (Expo) | 0.81.5 |
| React | react | 19.1.0 |
| UI Kit | react-native-paper | ^5.15.3 |
| Navigation | @react-navigation/native-stack | ^7.17.6 |
| Backend | firebase | ^12.15.0 |
| Maps | react-native-maps | 1.20.1 |
| Storage | @react-native-async-storage/async-storage | ^3.1.1 |
| Location | expo-location | ~19.0.8 |
| Notifications | expo-notifications | ~0.32.17 |
| Icons | @expo/vector-icons | ^15.0.3 |
| Animasi | react-native-reanimated | ~4.1.1 |

---

## 7. Design System

### Palet Warna

| Token | Light | Dark | Fungsi |
|---|---|---|---|
| `primary` | #0F4C81 | #2B6699 | Biru keamanan utama |
| `background` | #F5F7FA | #0F172A | Latar |
| `surface` | #FFFFFF | #1E293B | Kartu |
| `emergency` | #D32F2F | #EF4444 | Darurat |
| `warning` | #F9A825 | #F59E0B | Siaga |
| `success` | #2E7D32 | #10B981 | Selesai |

### Skala Spacing
`xs:4` `sm:8` `md:12` `lg:16` `xl:24` `xxl:32` (px)

### Tipografi
- `screenTitle`: 28px Bold
- `sectionTitle`: 20px Bold
- `body`: 16px Regular
- `bodyStrong`: 16px Bold
- `caption`: 14px Regular
- `button`: 15px Bold

### Elevation
`sm`, `md`, `lg` — shadow konsisten untuk kartu.

---

## 8. Izin & Konfigurasi

### Android (app.json)
- `ACCESS_FINE_LOCATION`
- `ACCESS_COARSE_LOCATION`
- `POST_NOTIFICATIONS`
- `VIBRATE`

### iOS (Info.plist)
- `NSLocationWhenInUseUsageDescription` — izin lokasi saat aplikasi aktif.

### Konfigurasi Firebase
- Database: `siagart-131d3-default-rtdb.asia-southeast1`
- Auth: anonymous sign-in
- Storage bucket: `siagart-131d3.firebasestorage.app`

---

## 9. Cara Menjalankan

```bash
# Install dependensi
npm install

# Jalankan Expo
npm start          # atau: npx expo start
npm run android    # emulator Android
npm run ios        # emulator iOS
npm run web        # browser
```

---

## 10. Catatan Teknis

- **Tanpa Firebase Authentication**: Phase 1 tidak menggunakan Firebase Auth untuk mempercepat development.
- **User ID auto-generated**: Menggunakan `push().key` dari Firebase Realtime Database untuk generate unique ID.
- **Server timestamps** (`serverTimestamp()`) untuk `createdAt` — konsisten antar perangkat.
- **Sorting** laporan di dashboard: terbaru dulu (`createdAt` descending).
- **Batasan lokal**: hanya 100 laporan terakhir disimpan di AsyncStorage.
- **Validasi**: Nama wajib diisi, nomor HP minimal 10 digit, role wajib dipilih.

---

*Dokumentasi dibuat berdasarkan analisis kode sumber. Terakhir diperbarui: 2026-08-03.*
