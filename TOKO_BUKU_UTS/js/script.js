const bacaData = (key, fallback) => {
  try {
    const nilai = JSON.parse(localStorage.getItem(key));
    return nilai === null ? fallback : nilai;
  } catch {
    return fallback;
  }
};
const simpanData = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const hargaAngka = (nilai) => {
  if (typeof nilai === "number") return nilai;
  return Number(String(nilai ?? "0").replace(/[^0-9]/g, "")) || 0;
};
const rupiah = (nilai) => new Intl.NumberFormat("id-ID", {
  style: "currency", currency: "IDR", maximumFractionDigits: 0
}).format(hargaAngka(nilai));
const tanggal = () => new Date().toLocaleDateString("id-ID");
const aman = (teks) => String(teks ?? "").replace(/[&<>"']/g, c => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
}[c]));

// Migrasi ringan: katalog versi lama (judul/penulis/id) tidak cocok dengan
// format dosen (kodeBarang/namaBarang/jenisBarang/edisi/harga/cover).
const katalogTersimpan = bacaData("tb_katalog", null);
if (!Array.isArray(katalogTersimpan) || (katalogTersimpan.length && !("kodeBarang" in katalogTersimpan[0]))) {
  localStorage.removeItem("tb_katalog");
}
const ambilBuku = () => bacaData("tb_katalog", dataKatalogBuku.map(b => ({ ...b })));
const simpanBuku = (data) => simpanData("tb_katalog", data);
const ambilPesanan = () => bacaData("tb_pesanan", []);
// Data tracking di data.js selalu dibaca ulang saat halaman dimuat.
// Jika nomor DO sama, data.js menjadi acuan utama; pesanan checkout lokal tetap ditambahkan.
const ambilSemuaTransaksi = () => {
  const gabungan = new Map(ambilPesanan().map(p => [String(p.do || p.nomorDO), p]));
  Object.values(dataTracking || {}).forEach(p => {
    const transaksi = {
      ...p,
      do: p.nomorDO,
      tanggal: p.tanggalKirim,
      total: p.total,
      perjalanan: p.perjalanan || []
    };
    gabungan.set(String(transaksi.do), transaksi);
  });
  return [...gabungan.values()];
};

// Data tracking belum menyimpan email maupun rincian item.
// Cocokkan nama pemesan ke dataPengguna, lalu gunakan total transaksi untuk
// mengenali buku pada data katalog jika rincian items belum tersedia.
const emailPemilikTransaksi = p => {
  if (p.email) return String(p.email).trim().toLowerCase();
  const akun = dataPengguna.find(a => String(a.nama).trim().toLowerCase() === String(p.nama || "").trim().toLowerCase());
  return String(akun?.email || "").trim().toLowerCase();
};
const transaksiMilikSesi = p => {
  const sesi = ambilSesi();
  if (!sesi) return false;
  return emailPemilikTransaksi(p) === String(sesi.email || "").trim().toLowerCase();
};
const jumlahBukuTransaksi = p => {
  if (Array.isArray(p.items)) return p.items.reduce((sum, item) => sum + Math.max(0, Number(item.qty) || 0), 0);
  const nilaiTotal = hargaAngka(p.total);
  const cocok = dataKatalogBuku.find(b => hargaAngka(b.harga) === nilaiTotal);
  return cocok ? 1 : 0;
};
const statusSelesai = status => ["diterima", "selesai", "selesai antar"].includes(String(status || "").trim().toLowerCase());
const isAdmin = () => (ambilSesi()?.role || "User").toLowerCase() === "admin";
const ambilAkunTambahan = () => bacaData("tb_akun_tambahan", []);
const ambilPasswordOverride = () => bacaData("tb_password_override", {});
const ambilSemuaAkun = () => {
  const override = ambilPasswordOverride();
  return [...dataPengguna, ...ambilAkunTambahan()].map(akun => ({
    ...akun,
    password: Object.prototype.hasOwnProperty.call(override, String(akun.email).toLowerCase())
      ? override[String(akun.email).toLowerCase()]
      : akun.password
  }));
};
const ambilSesi = () => {
  try { return JSON.parse(sessionStorage.getItem("tb_session")) || null; }
  catch { return null; }
};
const keluarAplikasi = () => {
  sessionStorage.removeItem("tb_session");
  sessionStorage.removeItem("tb_pengguna");
  window.location.href = "index.html";
};


const halamanAplikasi = !document.getElementById("formLogin");
if (halamanAplikasi) {
  const sesi = ambilSesi();
  if (!sesi) window.location.replace("index.html");
  else {
    document.querySelectorAll("[data-nama-pengguna]").forEach(el => el.textContent = `${sesi.nama} (${sesi.role})`);
    document.querySelectorAll("[data-logout]").forEach(el => el.addEventListener("click", keluarAplikasi));
    if ((sesi.role || "User").toLowerCase() !== "admin") {
      document.querySelectorAll("[data-admin-only]").forEach(el => el.classList.add("hidden"));
    }
  }
}

// Akun data
const formLogin = document.getElementById("formLogin");
if (formLogin) {
  formLogin.addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("pass").value;
    const akun = ambilSemuaAkun().find(a => String(a.email).toLowerCase() === email && a.password === password);
    if (!akun) {
      alert("email/password yang anda masukkan salah");
      return;
    }
    const sesi = { id: akun.id, nama: akun.nama, email: akun.email, role: akun.role || "User" };
    sessionStorage.setItem("tb_session", JSON.stringify(sesi));
    sessionStorage.setItem("tb_pengguna", akun.nama);
    window.location.href = "dashboard.html";
  });
}

// login,lupa password daftar
if (document.getElementById("popupDaftar")) {
  const bukaPopup = id => {
    const popup = document.getElementById(id);
    if (!popup) return;
    popup.classList.add("show");
    popup.setAttribute("aria-hidden", "false");
    popup.querySelector("input")?.focus();
  };
  const tutupPopup = popup => {
    popup.classList.remove("show");
    popup.setAttribute("aria-hidden", "true");
  };

  document.querySelectorAll("[data-open-popup]").forEach(tombol => {
    tombol.addEventListener("click", () => bukaPopup(tombol.dataset.openPopup));
  });
  document.querySelectorAll("[data-close-popup]").forEach(tombol => {
    tombol.addEventListener("click", () => tutupPopup(tombol.closest(".popup")));
  });
  document.querySelectorAll(".popup").forEach(popup => {
    popup.addEventListener("click", e => {
      if (e.target === popup) tutupPopup(popup);
    });
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") document.querySelectorAll(".popup.show").forEach(tutupPopup);
  });

  // Pendaftaran akun baru disimpan di localStorage 
  const formDaftar = document.getElementById("formDaftar");
  formDaftar.addEventListener("submit", e => {
    e.preventDefault();
    const nama = document.getElementById("namaDaftar").value.trim();
    const email = document.getElementById("emailDaftar").value.trim().toLowerCase();
    const password = document.getElementById("passwordDaftar").value;
    const konfirmasi = document.getElementById("konfirmasiDaftar").value;
    if (password.length < 6) { alert("Password minimal 6 karakter."); return; }
    if (password !== konfirmasi) { alert("Konfirmasi password tidak sama."); return; }
    if (ambilSemuaAkun().some(a => String(a.email).toLowerCase() === email)) {
      alert("Email sudah terdaftar. Silakan gunakan email lain."); return;
    }
    const akunBaru = { id: Date.now(), nama, email, password, role: "User" };
    simpanData("tb_akun_tambahan", [...ambilAkunTambahan(), akunBaru]);
    formDaftar.reset();
    tutupPopup(document.getElementById("popupDaftar"));
    document.getElementById("email").value = email;
    alert("Pendaftaran berhasil! Silakan login menggunakan email dan password baru.");
  });

  // Reset password email akun.
  const formLupaPassword = document.getElementById("formLupaPassword");
  formLupaPassword.addEventListener("submit", e => {
    e.preventDefault();
    const email = document.getElementById("emailReset").value.trim().toLowerCase();
    const password = document.getElementById("passwordBaru").value;
    const konfirmasi = document.getElementById("konfirmasiPassword").value;
    if (password.length < 6) { alert("Password minimal 6 karakter."); return; }
    if (password !== konfirmasi) { alert("Konfirmasi password tidak sama."); return; }
    const akun = ambilSemuaAkun().find(a => String(a.email).toLowerCase() === email);
    if (!akun) { alert("Email tidak ditemukan. Periksa kembali email akun Anda."); return; }
    const override = ambilPasswordOverride();
    override[email] = password;
    simpanData("tb_password_override", override);
    formLupaPassword.reset();
    tutupPopup(document.getElementById("popupLupaPassword"));
    document.getElementById("email").value = email;
    alert("Password berhasil diperbarui. Silakan login dengan password baru.");
  });
}

// dasboard, laporan, dan history transaksi
if (document.getElementById("greeting")) {
  const sesi = ambilSesi();
  const jam = new Date().getHours();
  const sapaan = jam < 11 ? "Selamat Pagi" : jam < 15 ? "Selamat Siang" : jam < 18 ? "Selamat Sore" : "Selamat Malam";
  document.getElementById("greeting").textContent = `${sapaan}, ${sesi?.nama || "Pengguna"}!`;
  document.getElementById("tanggalHariIni").textContent = tanggal();

  const semuaTransaksi = ambilSemuaTransaksi();
  const transaksi = isAdmin() ? semuaTransaksi : semuaTransaksi.filter(transaksiMilikSesi);
  const totalNilai = transaksi.reduce((sum, p) => sum + hargaAngka(p.total), 0);
  const totalBukuUser = transaksi.reduce((sum, p) => sum + jumlahBukuTransaksi(p), 0);

  // Admin melihat jumlah judul katalog; User melihat jumlah buku dalam pesanannya sendiri.
  document.getElementById("totalBuku").textContent = isAdmin() ? ambilBuku().length : totalBukuUser;
  document.getElementById("totalPesanan").textContent = transaksi.length;
  document.getElementById("pesananProses").textContent = transaksi.filter(p => !statusSelesai(p.status)).length;
  document.getElementById("totalTransaksi").textContent = rupiah(totalNilai);
  document.getElementById("laporanJumlah").textContent = transaksi.length;
  document.getElementById("laporanNilai").textContent = rupiah(totalNilai);

  const tbody = document.getElementById("tabelTransaksi");
  if (tbody) {
    tbody.innerHTML = transaksi.length
      ? transaksi.slice().reverse().slice(0, 8).map(p =>
        `<tr><td>${aman(p.do || p.nomorDO)}</td><td>${aman(p.nama)}</td><td>${aman(p.tanggal || p.tanggalKirim || "-")}</td><td>${rupiah(p.total)}</td><td>${aman(p.status)}</td></tr>`
      ).join("")
      : '<tr><td colspan="5" class="empty">Belum ada transaksi untuk akun ini.</td></tr>';
  }
}

// kataloq informasi buku
if (document.getElementById("tabelBuku")) {
  const tbody = document.getElementById("tabelBuku");
  const form = document.getElementById("formBuku");
  const gambarTabel = (kata = "") => {
    const q = kata.toLowerCase();
    const daftar = ambilBuku().filter(b =>
      [b.kodeBarang, b.namaBarang, b.jenisBarang].some(v => String(v).toLowerCase().includes(q))
    );
    tbody.innerHTML = daftar.length ? daftar.map((b, i) => `<tr>
      <td>${i + 1}</td>
      <td class="book-cell"><img class="book-cover-small" src="${aman(b.cover)}" alt="Sampul ${aman(b.namaBarang)}" onerror="this.style.display='none'"><span>${aman(b.namaBarang)}</span></td>
      <td>${aman(b.kodeBarang)}</td><td>${aman(b.jenisBarang)}</td><td>${aman(b.edisi)}</td>
      <td>${rupiah(b.harga)}</td><td>${Number(b.stok)}</td>
      <td>${isAdmin() ? `<button class="action-btn" data-edit="${aman(b.kodeBarang)}" type="button">Edit</button><button class="action-btn delete-btn" data-delete="${aman(b.kodeBarang)}" type="button">Hapus</button>` : '<span class="muted">Lihat saja</span>'}</td>
    </tr>`).join("") : '<tr><td colspan="8" class="empty">Buku tidak ditemukan.</td></tr>';
  };
  gambarTabel();
  document.getElementById("cariBuku").addEventListener("input", e => gambarTabel(e.target.value));
  document.getElementById("btnTampilFormBuku").addEventListener("click", () => {
    form.reset(); document.getElementById("kodeBuku" ).readOnly = false;
    document.getElementById("kodeBuku").value = ""; form.classList.remove("hidden");
  });
  document.getElementById("btnBatalBuku").addEventListener("click", () => form.classList.add("hidden"));
  tbody.addEventListener("click", e => {
    const kodeEdit = e.target.dataset.edit, kodeHapus = e.target.dataset.delete;
    if (kodeEdit) {
      const b = ambilBuku().find(x => x.kodeBarang === kodeEdit);
      if (!b) return;
      document.getElementById("kodeBuku").value = b.kodeBarang;
      document.getElementById("kodeBuku").readOnly = true;
      document.getElementById("judulBuku").value = b.namaBarang;
      document.getElementById("jenisBuku").value = b.jenisBarang;
      document.getElementById("edisiBuku").value = b.edisi;
      document.getElementById("hargaBuku").value = hargaAngka(b.harga);
      document.getElementById("stokBuku").value = b.stok;
      document.getElementById("coverBuku").value = b.cover;
      form.classList.remove("hidden");
    }
    if (kodeHapus && confirm("Hapus buku ini dari katalog?")) {
      simpanBuku(ambilBuku().filter(x => x.kodeBarang !== kodeHapus));
      gambarTabel(document.getElementById("cariBuku").value);
    }
  });
  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = ambilBuku();
    const kodeBarang = document.getElementById("kodeBuku").value.trim().toUpperCase();
    const sedangEdit = data.some(b => b.kodeBarang === kodeBarang);
    const bukuBaru = {
      kodeBarang,
      namaBarang: document.getElementById("judulBuku").value.trim(),
      jenisBarang: document.getElementById("jenisBuku").value.trim(),
      edisi: document.getElementById("edisiBuku").value.trim(),
      stok: Number(document.getElementById("stokBuku").value),
      harga: rupiah(Number(document.getElementById("hargaBuku").value)).replace("Rp", "Rp "),
      cover: document.getElementById("coverBuku").value.trim() || "img/pengantar_komunikasi.jpg"
    };
    if (!sedangEdit && data.some(b => b.kodeBarang.toLowerCase() === kodeBarang.toLowerCase())) {
      alert("Kode barang sudah digunakan."); return;
    }
    simpanBuku(sedangEdit ? data.map(b => b.kodeBarang === kodeBarang ? bukuBaru : b) : [...data, bukuBaru]);
    form.reset(); document.getElementById("kodeBuku").readOnly = false;
    form.classList.add("hidden"); gambarTabel(document.getElementById("cariBuku").value);
  });
}

// Cheackout, total, dan stok
if (document.getElementById("formCheckout")) {
  let itemPesanan = [];
  const sesi = ambilSesi();
  const namaInput = document.getElementById("namaPemesan");
  const emailInput = document.getElementById("emailPemesan");
  if (sesi) {
    namaInput.value = sesi.nama;
    emailInput.value = sesi.email;
    // User hanya membuat pesanan untuk akun sendiri; Admin tetap dapat mengisi pemesan.
    if (!isAdmin()) { namaInput.readOnly = true; emailInput.readOnly = true; }
  }
  const pilih = document.getElementById("pilihBuku");
  const tbody = document.getElementById("tabelItemPesanan");
  const isiPilihan = () => {
    const daftar = ambilBuku().filter(b => Number(b.stok) > 0);
    pilih.innerHTML = daftar.map(b => `<option value="${aman(b.kodeBarang)}">${aman(b.namaBarang)} - ${rupiah(b.harga)} (Stok ${b.stok})</option>`).join("");
    if (!daftar.length) pilih.innerHTML = '<option value="">Stok buku sedang kosong</option>';
  };
  const gambarItem = () => {
    tbody.innerHTML = itemPesanan.length ? itemPesanan.map((it, i) => `<tr>
      <td>${aman(it.namaBarang)}</td>
      <td><input class="qty-edit" type="number" min="1" value="${it.qty}" data-qty="${i}" aria-label="Jumlah ${aman(it.namaBarang)}"></td>
      <td>${rupiah(it.harga * it.qty)}</td>
      <td><button type="button" class="action-btn delete-btn" data-remove="${i}">Hapus</button></td>
    </tr>`).join("") : '<tr><td colspan="4" class="empty">Belum ada buku dipilih.</td></tr>';
    document.getElementById("totalCheckout").textContent = rupiah(itemPesanan.reduce((s, it) => s + it.harga * it.qty, 0));
  };
  isiPilihan(); gambarItem();
  document.getElementById("btnTambahItem").addEventListener("click", () => {
    const buku = ambilBuku().find(x => x.kodeBarang === pilih.value);
    const qty = Number(document.getElementById("jumlahBuku").value);
    if (!buku || !Number.isInteger(qty) || qty < 1) { alert("Pilih buku dan jumlah yang benar."); return; }
    const sudah = itemPesanan.find(x => x.kodeBarang === buku.kodeBarang);
    const jumlahAkhir = qty + (sudah ? sudah.qty : 0);
    if (jumlahAkhir > Number(buku.stok)) { alert("Jumlah melebihi stok yang tersedia."); return; }
    if (sudah) sudah.qty += qty;
    else itemPesanan.push({ kodeBarang: buku.kodeBarang, namaBarang: buku.namaBarang, harga: hargaAngka(buku.harga), qty });
    document.getElementById("jumlahBuku").value = 1;
    gambarItem();
  });
  tbody.addEventListener("change", e => {
    if (e.target.dataset.qty === undefined) return;
    const index = Number(e.target.dataset.qty), qty = Number(e.target.value);
    const buku = ambilBuku().find(x => x.kodeBarang === itemPesanan[index]?.kodeBarang);
    if (!buku || !Number.isInteger(qty) || qty < 1 || qty > Number(buku.stok)) {
      alert("Jumlah tidak valid atau melebihi stok."); gambarItem(); return;
    }
    itemPesanan[index].qty = qty; gambarItem();
  });
  tbody.addEventListener("click", e => {
    if (e.target.dataset.remove !== undefined) {
      itemPesanan.splice(Number(e.target.dataset.remove), 1); gambarItem();
    }
  });
  document.getElementById("formCheckout").addEventListener("submit", e => {
    e.preventDefault();
    if (!itemPesanan.length) { alert("Tambahkan minimal satu buku ke pesanan."); return; }
    const dataBuku = ambilBuku();
    for (const it of itemPesanan) {
      const b = dataBuku.find(x => x.kodeBarang === it.kodeBarang);
      if (!b || Number(b.stok) < it.qty) { alert(`Stok ${it.namaBarang} tidak mencukupi.`); return; }
    }
    const total = itemPesanan.reduce((s, it) => s + it.harga * it.qty, 0);
    const nomor = "DO" + new Date().toISOString().slice(0, 10).replaceAll("-", "") + String(Date.now()).slice(-4);
    const pesanan = {
      do: nomor,
      nama: namaInput.value.trim(),
      email: emailInput.value.trim(),
      alamat: document.getElementById("alamatPemesan").value.trim(),
      ekspedisi: document.getElementById("ekspedisi").value,
      paket: document.getElementById("jenisPaket").value,
      pembayaran: document.getElementById("metodeBayar").value,
      tanggal: tanggal(),
      items: itemPesanan.map(it => ({ ...it })),
      total,
      status: "Diproses",
      perjalanan: [{ waktu: new Date().toLocaleString("id-ID"), keterangan: "Pesanan diterima dan sedang diproses oleh toko." }]
    };
    itemPesanan.forEach(it => {
      const b = dataBuku.find(x => x.kodeBarang === it.kodeBarang);
      b.stok = Number(b.stok) - it.qty;
    });
    simpanBuku(dataBuku);
    const daftarPesanan = ambilPesanan(); daftarPesanan.push(pesanan); simpanData("tb_pesanan", daftarPesanan);
    alert("Pesanan berhasil dibuat. Nomor Delivery Order: " + nomor);
    window.location.href = "tracking.html?do=" + encodeURIComponent(nomor);
  });
}

// tracking data
if (document.getElementById("formTracking")) {
  const hasil = document.getElementById("hasilTracking");
  const tahapan = ["Diproses", "Dikirim", "Dalam Perjalanan", "Diterima"];
  const tampilkan = (nomorInput) => {
    const nomor = nomorInput.trim();
    const pesananBaru = ambilPesanan().find(x => x.do.toLowerCase() === nomor.toLowerCase());
    const dataAwal = dataTracking[nomor];
    const p = pesananBaru || dataAwal;
    hasil.classList.remove("hidden");
    if (!p) {
      hasil.innerHTML = '<p class="empty">Nomor Delivery Order tidak ditemukan. Periksa kembali nomor DO yang dimasukkan.</p>';
      return;
    }
    const status = p.status || "Diproses";
    const statusIndex = tahapan.indexOf(status);
    const tanggalKirim = p.tanggalKirim || p.tanggal || "Belum dikirim";
    const total = p.total;
    const ekspedisi = p.ekspedisi || "Belum ditentukan";
    const paket = p.paket || "Belum ditentukan";
    const perjalanan = p.perjalanan || [];
    hasil.innerHTML = `<h2>Detail Pengiriman</h2>
      <div class="tracking-details">
        <div class="detail-item"><span>Nomor DO</span><b>${aman(p.nomorDO || p.do)}</b></div>
        <div class="detail-item"><span>Nama Pemesan</span><b>${aman(p.nama)}</b></div>
        <div class="detail-item"><span>Ekspedisi</span><b>${aman(ekspedisi)}</b></div>
        <div class="detail-item"><span>Tanggal Kirim / Pesanan</span><b>${aman(tanggalKirim)}</b></div>
        <div class="detail-item"><span>Jenis Paket</span><b>${aman(paket)}</b></div>
        <div class="detail-item"><span>Total Pembayaran</span><b>${rupiah(total)}</b></div>
        <div class="detail-item"><span>Status</span><b>${aman(status)}</b></div>
      </div>
      <h3>Status Pengiriman</h3>
      <div class="progress-list">${tahapan.map((t, i) => `<div class="progress-step ${statusIndex >= 0 && i <= statusIndex ? "done" : ""}">${statusIndex >= 0 && i <= statusIndex ? "✓ " : ""}${t}</div>`).join("")}</div>
      <h3 class="timeline-title">Riwayat Perjalanan</h3>
      ${perjalanan.length ? `<ol class="tracking-timeline">${perjalanan.map(item => `<li><b>${aman(item.waktu)}</b><span>${aman(item.keterangan)}</span></li>`).join("")}</ol>` : '<p class="muted small">Belum ada riwayat perjalanan. Status akan diperbarui secara simulasi.</p>'}`;
  };
  document.getElementById("formTracking").addEventListener("submit", e => {
    e.preventDefault(); tampilkan(document.getElementById("nomorDO").value);
  });
  const nomorAwal = new URLSearchParams(location.search).get("do");
  if (nomorAwal) { document.getElementById("nomorDO").value = nomorAwal; tampilkan(nomorAwal); }
}
