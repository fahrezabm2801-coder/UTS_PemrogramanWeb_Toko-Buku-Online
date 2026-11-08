## Cara menjalankan
1. Ekstrak folder `TOKO_BUKU_UTS`.
2. Buka folder tersebut di VS Code.
3. Jalankan `index.html` melalui browser.

## Akun demo dari data dosen
- User: `rina@gmail.com` / `rina123`
- User: `agus@gmail.com` / `agus123`
- Admin: `siti@gmail.com` / `siti123`

## Halaman
- `index.html`: login menggunakan akun pada `dataPengguna` di `data.js`.
- `dashboard.html`: greeting, ringkasan, laporan, dan history transaksi. User hanya melihat transaksi miliknya; Admin melihat seluruh transaksi.
- `stok.html`: katalog dari `dataKatalogBuku`, pencarian, tambah, edit, dan hapus buku.
- `checkout.html`: data pemesan, tambah/hapus item, ubah jumlah, pembayaran, dan total otomatis.
- `tracking.html`: pencarian nomor DO, detail, progress, dan riwayat perjalanan.

## Struktur
- `css/style.css`
- `js/data.js` 
- `js/script.js`
- `img/`


## Fitur login tambahan
- Tombol **Lupa Password?** membuka modal untuk mengatur password baru berdasarkan email akun.
- Tombol **Daftar** membuka modal pembuatan akun User baru.
- Akun baru dan perubahan password disimpan pada `localStorage` browser.
- Catatan: fitur autentikasi ini masih simulasi front-end untuk tugas/demo. Reset password belum mengirim tautan verifikasi ke email; aplikasi produksi perlu backend dan verifikasi identitas.
