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
        document.getElementById("console_tag").innerText = "Error: Gagal memuat data provinsi";
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
            document.getElementById("console_tag").innerText = "Error: Gagal memuat data kabupaten/kota";
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
            document.getElementById("console_tag").innerText = "Error: Gagal memuat data kecamatan";
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
            document.getElementById("console_tag").innerText = "Error: Gagal memuat data desa/kelurahan";
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

    // Validasi
    if (!nama || !provinsi || !kabkota || !kecamatan || !desa || !alamatLengkap) {
        submission_valid = false;
    }

    if (submission_valid) {
        // Ambil nama lengkap (bukan ID) dari dropdown
        const provinsiNama = provinsiSelect.options[provinsiSelect.selectedIndex].text;
        const kabkotaNama = kabkotaSelect.options[kabkotaSelect.selectedIndex].text;
        const kecamatanNama = kecamatanSelect.options[kecamatanSelect.selectedIndex].text;
        const desaNama = desaSelect.options[desaSelect.selectedIndex].text;
        
        const alamatFull = 
`${alamatLengkap}, Desa/Kel. ${desaNama}, Kec. ${kecamatanNama}, ${kabkotaNama}, ${provinsiNama}${kodepos ? ', ' + kodepos : ''}`;
        
        const mesg = 
`*PESANAN KAOSKLOTH*

*Nama:* ${nama}

*Alamat Lengkap:*
${alamatFull}

Terima kasih!`;

        document.getElementById("console_tag").innerText = "";
        const urls = "https://wa.me/6285875730924?text=" + encodeURIComponent(mesg);
        window.open(urls, "_blank");
    } else {
        document.getElementById("console_tag").innerText = "Error: Mohon lengkapi semua field yang wajib diisi!";
    }
}

let form = document.getElementById("orderForm");
form.addEventListener("submit", onSubmitForm);

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

    // Validasi
    if (!nama || !telepon || !provinsi || !kabkota || !kecamatan || !desa || !alamatLengkap) {
        submission_valid = false;
    }

    if (submission_valid) {
        const alamatFull = 
`${alamatLengkap}, Desa/Kel. ${desa}, Kec. ${kecamatan}, ${kabkota}, ${provinsi}${kodepos ? ', ' + kodepos : ''}`;
        
        const mesg = 
`*PESANAN KAOSKLOTH*

*Nama:* ${nama}

*Alamat Lengkap:*
${alamatFull}

Terima kasih!`;

        document.getElementById("console_tag").innerText = "";
        const urls = "https://wa.me/6285875730924?text=" + encodeURIComponent(mesg);
        window.open(urls, "_blank");
    } else {
        document.getElementById("console_tag").innerText = "Error: Mohon lengkapi semua field yang wajib diisi!";
    }
}

let form = document.getElementById("orderForm");
form.addEventListener("submit", onSubmitForm);
