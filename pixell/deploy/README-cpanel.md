# Deploy Pixell ke cPanel

Project ini adalah Next.js App Router + API route + MySQL.
Artinya:
- Bisa dipakai di cPanel kalau hosting kamu punya fitur **Setup Node.js App**.
- Kalau cPanel hanya punya **File Manager + PHP** tanpa Node.js, project ini **tidak bisa jalan penuh** karena ada API route Next.js dan koneksi MySQL dari server Node.

## 1) Yang perlu disiapkan

- Akses cPanel
- Node.js support di cPanel
- Database MySQL dari **MySQL Database Wizard**
- Folder project ini yang sudah siap upload

## 2) Bikin database di cPanel

Masuk ke cPanel lalu buka:
- `MySQL Database Wizard`

Lalu ikuti urutan ini:
1. Buat nama database, contoh: `itfestival`
2. Buat username database, contoh: `itfestival_user`
3. Buat password yang kuat
4. Klik `Create User`
5. Centang `ALL PRIVILEGES`
6. Klik `Next Step`

Catatan:
- Di cPanel biasanya nama database/user akan otomatis diberi prefix akun hosting.
- Contoh hasil akhir bisa jadi: `cpaneluser_itfestival`
- Di file `.env` harus dipakai **nama final yang tampil di cPanel**, bukan nama pendek yang kamu ketik.

## 3) Import tabel MySQL

1. Buka `phpMyAdmin`
2. Pilih database yang sudah dibuat
3. Buka tab `Import`
4. Import file:
   - `deploy/cpanel-schema.sql`

File ini sudah disesuaikan untuk cPanel:
- tidak membuat database baru
- langsung membuat tabel
- langsung isi data awal

## 4) Set environment variable

Buat file `.env` di root project cPanel kamu, isinya kira-kira begini:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=cpaneluser_itfestival
MYSQL_USER=cpaneluser_itfestival_user
MYSQL_PASSWORD=password_yang_kamu_buat

ADMIN_USER=admin
ADMIN_PASSWORD=GantiPasswordAdminKamu
```

Kalau hosting kamu pakai host MySQL berbeda, pakai nilai dari cPanel.

## 5) Upload file project

Kalau pakai Node.js App:
1. Upload isi project ke folder app root, misalnya `pixell`
2. Pastikan file berikut ada di folder itu:
   - `package.json`
   - `server.js` atau startup file yang dipakai cPanel
   - folder `app`
   - folder `components`
   - folder `lib`
   - folder `public`
   - folder `data`

Jangan upload folder `node_modules` dari lokal kalau tidak perlu.
Lebih aman install dependency langsung di server lewat Node.js App.

## 6) Buat Node.js App di cPanel

Masuk ke:
- `Setup Node.js App`

Lalu buat app baru:
- Node version: pakai yang terbaru yang tersedia, idealnya 20+
- Application mode: Production
- Application root: folder project kamu, contoh `pixell`
- Application URL: domain utama kalau mau di root, atau subfolder/subdomain kalau mau dipisah
- Startup file: `server.js`

Kalau panel kamu tidak minta startup file, biasanya cukup arahkan ke app root dan jalankan install.

## 7) Install dependency

Di Node.js App, jalankan:
- `npm install`

Lalu build project:
- `npm run build`

Setelah itu restart aplikasi Node.js.

## 8) Biar halaman web utama nyambung rapi

Kalau mau web tampil di domain utama:
- set `Application URL` ke root domain
- jadi route seperti `/admin`, `/competition`, `/training`, `/seminar` tetap nyambung otomatis

Kalau mau taruh di subfolder:
- contoh `domainkamu.com/pixell`
- nanti perlu penyesuaian `basePath` di `next.config.ts`

Kalau kamu mau, saya bisa bantu sesuaikan `basePath` juga.

## 9) Admin panel

Admin login ada di:
- `/admin`

Login pakai environment:
- `ADMIN_USER`
- `ADMIN_PASSWORD`

## 10) Cek setelah deploy

Buka:
- Home: `/`
- Admin: `/admin`
- Partner API: `/api/partners`
- Timeline API: `/api/timeline`

Kalau partner atau media partner tidak muncul:
- cek `.env`
- cek import database
- cek log Node.js App

## 11) Kalau cPanel kamu tidak punya Node.js App

Berarti ada 2 opsi:
1. Pindah hosting ke yang support Node.js
2. Ubah project supaya backend pakai PHP biasa

Untuk project ini, opsi paling aman adalah **Node.js App**.
