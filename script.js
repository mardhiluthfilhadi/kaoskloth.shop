const themeToggle = document.getElementById('themeToggle');
const lightBtn = document.getElementById('lightBtn');
const darkBtn = document.getElementById('darkBtn');
const body = document.body;

const currentTheme = localStorage.getItem('theme') || 'light';

if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
    lightBtn.classList.remove('active');
    darkBtn.classList.add('active');
}

lightBtn.addEventListener('click', () => {
    body.classList.remove('dark-mode');
    lightBtn.classList.add('active');
    darkBtn.classList.remove('active');
    localStorage.setItem('theme', 'light');
});

darkBtn.addEventListener('click', () => {
    body.classList.add('dark-mode');
    lightBtn.classList.remove('active');
    darkBtn.classList.add('active');
    localStorage.setItem('theme', 'dark');
});

document.querySelector('.footer-year').textContent = new Date().getFullYear();

const provinsiSelect = document.getElementById("provinsi_tag");
const kabkotaSelect = document.getElementById("kabkota_tag");
const kecamatanSelect = document.getElementById("kecamatan_tag");
const desaSelect = document.getElementById("desa_tag");

// Menyimpan data yang sudah di-fetch untuk caching
const cachedData = {
    provinsi: null,
    kabupaten: {},
    kecamatan: {},
    desa: {}
};

// Keranjang belanja
let cart = [];

// Fungsi untuk fetch JSON file
async function fetchJSON(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${path}:`, error);
        return null;
    }
}

// Load provinsi saat halaman dimuat
async function loadProvinsi() {
    const data = await fetchJSON('provinsi/provinsi.json');
    if (data) {
        cachedData.provinsi = data;
        // Sort berdasarkan nama
        const sortedEntries = Object.entries(data).sort((a, b) => a[1].localeCompare(b[1]));
        
        sortedEntries.forEach(([id, nama]) => {
            const option = document.createElement("option");
            option.value = id;
            option.textContent = nama;
            option.dataset.provId = id;
            provinsiSelect.appendChild(option);
        });
    } else {
        showErrorAndScroll("Gagal memuat data provinsi. Silakan refresh halaman.", "provinsi_tag");
    }
}

// Load kabupaten berdasarkan provinsi
async function loadKabupaten(provId) {
    if (!provId) return;
    
    // Cek cache terlebih dahulu
    if (!cachedData.kabupaten[provId]) {
        const data = await fetchJSON(`kabupaten_kota/kab-${provId}.json`);
        if (data) {
            cachedData.kabupaten[provId] = data;
        } else {
            showErrorAndScroll("Gagal memuat data kabupaten/kota. Silakan coba lagi.", "kabkota_tag");
            return;
        }
    }
    
    kabkotaSelect.innerHTML = '<option value="">-- Pilih Kabupaten/Kota --</option>';
    // Sort berdasarkan nama
    const sortedEntries = Object.entries(cachedData.kabupaten[provId]).sort((a, b) => a[1].localeCompare(b[1]));
    
    sortedEntries.forEach(([id, nama]) => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = nama;
        option.dataset.kabId = id;
        kabkotaSelect.appendChild(option);
    });
    kabkotaSelect.disabled = false;
}

// Load kecamatan berdasarkan provinsi dan kabupaten
async function loadKecamatan(provId, kabId) {
    if (!provId || !kabId) return;
    
    const key = `${provId}-${kabId}`;
    
    // Cek cache terlebih dahulu
    if (!cachedData.kecamatan[key]) {
        const data = await fetchJSON(`kecamatan/kec-${provId}-${kabId}.json`);
        if (data) {
            cachedData.kecamatan[key] = data;
        } else {
            showErrorAndScroll("Gagal memuat data kecamatan. Silakan coba lagi.", "kecamatan_tag");
            return;
        }
    }
    
    kecamatanSelect.innerHTML = '<option value="">-- Pilih Kecamatan --</option>';
    // Sort berdasarkan nama
    const sortedEntries = Object.entries(cachedData.kecamatan[key]).sort((a, b) => a[1].localeCompare(b[1]));
    
    sortedEntries.forEach(([id, nama]) => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = nama;
        option.dataset.kecId = id;
        kecamatanSelect.appendChild(option);
    });
    kecamatanSelect.disabled = false;
}

// Load desa berdasarkan provinsi, kabupaten, dan kecamatan
async function loadDesa(provId, kabId, kecId) {
    if (!provId || !kabId || !kecId) return;
    
    const key = `${provId}-${kabId}-${kecId}`;
    
    // Cek cache terlebih dahulu
    if (!cachedData.desa[key]) {
        const data = await fetchJSON(`kelurahan_desa/keldesa-${provId}-${kabId}-${kecId}.json`);
        if (data) {
            cachedData.desa[key] = data;
        } else {
            showErrorAndScroll("Gagal memuat data desa/kelurahan. Silakan coba lagi.", "desa_tag");
            return;
        }
    }
    
    desaSelect.innerHTML = '<option value="">-- Pilih Desa/Kelurahan --</option>';
    // Sort berdasarkan nama
    const sortedEntries = Object.entries(cachedData.desa[key]).sort((a, b) => a[1].localeCompare(b[1]));
    
    sortedEntries.forEach(([id, nama]) => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = nama;
        desaSelect.appendChild(option);
    });
    desaSelect.disabled = false;
}

// Event listeners untuk cascading dropdown
provinsiSelect.addEventListener("change", async function() {
    const provId = this.value;
    
    // Reset dropdown di bawahnya
    kabkotaSelect.innerHTML = '<option value="">-- Pilih Kabupaten/Kota --</option>';
    kecamatanSelect.innerHTML = '<option value="">-- Pilih Kecamatan --</option>';
    desaSelect.innerHTML = '<option value="">-- Pilih Desa/Kelurahan --</option>';
    kabkotaSelect.disabled = true;
    kecamatanSelect.disabled = true;
    desaSelect.disabled = true;
    
    if (provId) {
        await loadKabupaten(provId);
    }
});

kabkotaSelect.addEventListener("change", async function() {
    const provId = provinsiSelect.value;
    const kabId = this.value;
    
    // Reset dropdown di bawahnya
    kecamatanSelect.innerHTML = '<option value="">-- Pilih Kecamatan --</option>';
    desaSelect.innerHTML = '<option value="">-- Pilih Desa/Kelurahan --</option>';
    kecamatanSelect.disabled = true;
    desaSelect.disabled = true;
    
    if (kabId) {
        await loadKecamatan(provId, kabId);
    }
});

kecamatanSelect.addEventListener("change", async function() {
    const provId = provinsiSelect.value;
    const kabId = kabkotaSelect.value;
    const kecId = this.value;
    
    // Reset dropdown di bawahnya
    desaSelect.innerHTML = '<option value="">-- Pilih Desa/Kelurahan --</option>';
    desaSelect.disabled = true;
    
    if (kecId) {
        await loadDesa(provId, kabId, kecId);
    }
});

// Load provinsi saat halaman dimuat
loadProvinsi();

// Fungsi untuk capitalize text
function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// Fungsi untuk menampilkan error pop-up dan scroll ke elemen
function showErrorAndScroll(message, elementId = null) {
    // Tampilkan alert
    alert(message);
    
    // Scroll ke elemen jika ada
    if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
            
            // Tambahkan efek highlight sementara
            element.style.transition = 'all 0.3s';
            element.style.border = '2px solid #e74c3c';
            element.style.boxShadow = '0 0 10px rgba(231, 76, 60, 0.5)';
            
            setTimeout(() => {
                element.style.border = '';
                element.style.boxShadow = '';
            }, 2000);
        }
    }
}

// Fungsi untuk menampilkan keranjang
function renderCart() {
    const cartSection = document.getElementById('cartSection');
    const cartItems = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartSection.style.display = 'none';
        return;
    }
    
    cartSection.style.display = 'block';
    cartItems.innerHTML = '';
    
    cart.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-title">#${index + 1}</div>
                <div class="cart-item-details">Jenis kaos: ${capitalize(item.jenisKaos)} | Ilustrasi: ${capitalize(item.ilustrasi)}</div>
            </div>
            <br/>
            <button type="button" class="cart-item-remove" onclick="removeFromCart(${index})">X</button>
        `;
        cartItems.appendChild(cartItem);
    });
}

// Fungsi untuk menambah ke keranjang
function addToCart(e) {
    e.preventDefault();

    const jenisKaos = document.querySelector('input[name="jenis_kaos"]:checked');
    const ilustrasi = document.querySelector('input[name="ilustrasi"]:checked');
    
    if (!jenisKaos) {
        showErrorAndScroll("Pilih jenis kaos terlebih dahulu!", "orderForm");
        // Scroll ke bagian jenis kaos
        const firstKaosRadio = document.querySelector('input[name="jenis_kaos"]');
        if (firstKaosRadio) {
            firstKaosRadio.closest('.form-section').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }
    
    if (!ilustrasi) {
        showErrorAndScroll("Pilih ilustrasi terlebih dahulu!", "orderForm");
        // Scroll ke bagian ilustrasi
        const firstIlustrasiRadio = document.querySelector('input[name="ilustrasi"]');
        if (firstIlustrasiRadio) {
            firstIlustrasiRadio.closest('.form-section').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }
    
    cart.push({
        jenisKaos: jenisKaos.value,
        ilustrasi: ilustrasi.value
    });
    
    // Reset pilihan
    document.querySelectorAll('input[name="jenis_kaos"]').forEach(input => input.checked = false);
    document.querySelectorAll('input[name="ilustrasi"]').forEach(input => input.checked = false);
    
    document.getElementById("console_tag").innerText = "";
    renderCart();
}

// Fungsi untuk menghapus dari keranjang
function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

// Event listener untuk tombol tambah ke keranjang
document.getElementById('addToCartBtn').addEventListener('click', addToCart);

// Fungsi submit form
function onSubmitForm(e) {
    e.preventDefault();
    let submission_valid = true;
    
    const nama = document.getElementById("nama_tag").value.trim();
    const provinsi = provinsiSelect.value;
    const kabkota = kabkotaSelect.value;
    const kecamatan = kecamatanSelect.value;
    const desa = desaSelect.value;
    const alamatLengkap = document.getElementById("alamat_lengkap_tag").value.trim();
    const kodepos = document.getElementById("kodepos_tag").value.trim();

    // Validasi nama
    if (!nama) {
        showErrorAndScroll("Mohon isi nama lengkap Anda!", "nama_tag");
        return;
    }

    // Validasi provinsi
    if (!provinsi) {
        showErrorAndScroll("Mohon pilih provinsi!", "provinsi_tag");
        return;
    }

    // Validasi kabupaten/kota
    if (!kabkota) {
        showErrorAndScroll("Mohon pilih kabupaten/kota!", "kabkota_tag");
        return;
    }

    // Validasi kecamatan
    if (!kecamatan) {
        showErrorAndScroll("Mohon pilih kecamatan!", "kecamatan_tag");
        return;
    }

    // Validasi desa
    if (!desa) {
        showErrorAndScroll("Mohon pilih desa/kelurahan!", "desa_tag");
        return;
    }

    // Validasi alamat lengkap
    if (!alamatLengkap) {
        showErrorAndScroll("Mohon isi alamat lengkap (nama jalan, nomor rumah, RT/RW)!", "alamat_lengkap_tag");
        return;
    }

    // Validasi keranjang
    if (cart.length === 0) {
        showErrorAndScroll("Keranjang masih kosong! Tambahkan produk terlebih dahulu.", "orderForm");
        // Scroll ke bagian jenis kaos
        const firstKaosRadio = document.querySelector('input[name="jenis_kaos"]');
        if (firstKaosRadio) {
            firstKaosRadio.closest('.form-section').scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    // Jika semua validasi lolos
    const provinsiNama = provinsiSelect.options[provinsiSelect.selectedIndex].text;
    const kabkotaNama = kabkotaSelect.options[kabkotaSelect.selectedIndex].text;
    const kecamatanNama = kecamatanSelect.options[kecamatanSelect.selectedIndex].text;
    const desaNama = desaSelect.options[desaSelect.selectedIndex].text;
    
    const alamatFull = 
        `${capitalize(alamatLengkap)}, DESA/KEL. ${desaNama}, KEC. ${kecamatanNama}, ${kabkotaNama}, ${provinsiNama}${kodepos ? ', ' + kodepos : ''}`;
    
    // Format daftar produk
    let productList = '';
    cart.forEach((item, index) => {
        productList += `${index + 1}. Jenis Kaos: ${capitalize(item.jenisKaos)} - Ilustrasi: ${capitalize(item.ilustrasi)}\n`;
    });
    
    const mesg = 
`*PESANAN KAOSKLOTH*

*Nama:* ${nama}

*Daftar Produk:*
${productList}
*Total Item:* ${cart.length}

*Alamat Lengkap:*
${alamatFull}

Terima kasih!`;

    document.getElementById("console_tag").innerText = "";
    const urls = "https://wa.me/6285875730924?text=" + encodeURIComponent(mesg);
    window.open(urls, "_self");
}

let form = document.getElementById("orderForm");
form.addEventListener("submit", onSubmitForm);
