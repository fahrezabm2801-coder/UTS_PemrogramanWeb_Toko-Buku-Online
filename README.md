# Aplikasi Toko Buku Online — Bilik Buku
Aplikasi toko buku online sederhana berbasis **HTML, CSS, dan JavaScript**. Aplikasi ini dibuat sebagai proyek/tugas UTS untuk mendemonstrasikan proses login, pengelolaan katalog buku, checkout, dan pelacakan pengiriman.

## 1. Fitur Aplikasi

### Login dan akun
- Login menggunakan email dan password.
- Tombol **Lupa Password?** membuka modal/pop-up untuk mengganti password berdasarkan email akun.
- Tombol **Daftar** membuka modal/pop-up pendaftaran akun pengguna baru.
- Form pendaftaran memeriksa kelengkapan data, format email, kesesuaian password, dan email yang sudah terdaftar.
- Password minimal 6 karakter.
- Akun baru dan perubahan password disimpan pada `localStorage` browser.

### Dashboard
- Menampilkan ringkasan dan informasi transaksi.
- Menampilkan riwayat transaksi sesuai hak akses pengguna.
- Admin dapat melihat seluruh transaksi, sedangkan User hanya melihat transaksi miliknya.

### Katalog dan stok buku
- Menampilkan daftar buku.
- Pencarian buku.
- Menambah, mengubah, dan menghapus data buku.

### Checkout
- Mengisi data pemesan.
- Menambahkan atau menghapus item pesanan.
- Mengubah jumlah buku.
- Menghitung total pembayaran secara otomatis.
- Menyimpan transaksi simulasi.

### Tracking pengiriman
- Mencari pesanan menggunakan nomor DO.
- Menampilkan detail pesanan dan progres/riwayat perjalanan pengiriman.

## 2. Struktur Folder

```text
TOKO_BUKU_UTS/
├── assets/
│   └── toko buku.png
├── css/
│   └── style.css
├── img/
│   ├── paud_perkembangan.jpg
│   ├── paud_perkembangan.jpeg
│   ├── pengantar_komunikasi.jpg
│   ├── manajemen_keuangan.jpg
│   ├── mikrobiologi.jpg
│   └── kepemimpinan.jpg
├── js/
│   ├── data.js
│   └── script.js
├── index.html
├── dashboard.html
├── stok.html
├── checkout.html
├── tracking.html
└── README.md
```

## 3. Cara Menjalankan Aplikasi

1. Ekstrak file ZIP aplikasi.
2. Buka folder `TOKO_BUKU_UTS` menggunakan Visual Studio Code atau editor kode lainnya.
3. Jalankan file `index.html` melalui browser.
4. Untuk pengalaman pengembangan yang lebih nyaman, file dapat dijalankan menggunakan ekstensi **Live Server** di Visual Studio Code: klik kanan `index.html`, lalu pilih **Open with Live Server**.
5. Login menggunakan akun demo yang tersedia atau buat akun baru melalui tombol **Daftar**.

## 4. Akun Demo

| Hak akses | Email | Password |
|---|---|---|
| User | `rina@gmail.com` | `rina123` |
| User | `agus@gmail.com` | `agus123` |
| Admin | `siti@gmail.com` | `siti123` |

Akun demo tersebut disediakan untuk pengujian aplikasi. Pengguna juga dapat membuat akun User baru melalui modal **Daftar**.

## 5. Penyimpanan Data

Data awal pengguna dan katalog tersedia pada `js/data.js`. Interaksi dan logika aplikasi berada pada `js/script.js`.

Beberapa data dan perubahan selama penggunaan disimpan pada `localStorage` browser. Karena itu:
- Data tersimpan pada browser dan perangkat yang digunakan.
- Data tidak otomatis tersinkron ke browser atau perangkat lain.
- Menghapus data situs/browser dapat menghapus data aplikasi yang tersimpan.
- Untuk mengulang demonstrasi dari kondisi awal, data `localStorage` aplikasi dapat dibersihkan melalui pengaturan penyimpanan browser.

## 6. Screenshot 

Dokumentasi berikut digunakan untuk menunjukkan hasil pengerjaan Web Bilik Buku.

### Dokumentasi 

### 1. Menu Login  

### 2. Dasboard

### 3. Informasi Stock

### 4. Checkout

### 5. Tracking

### Video Dokumentasi
https://youtu.be/EXaFadwXTnw
