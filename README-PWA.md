# PWA untuk A'ini Retail ERP (Google Apps Script)

## Kenapa bukan taruh manifest/SW langsung di project GAS?

Web app GAS (`.../exec`) selalu redirect ke domain `script.googleusercontent.com`
dengan token acak per-request. Browser **menolak register Service Worker kalau
proses ambil file SW kena redirect** (SecurityError). Ini limitasi Apps Script,
bukan bug kode. Jadi manifest.json + service-worker.js taruh di **shell/wrapper**
terpisah (folder `pwa/` ini), yang isinya cuma nge-iframe app GAS asli kamu.

**Business logic GAS 100% tidak diubah** — file `src/` kamu tetap sama persis,
tidak disentuh sama sekali.

## Isi folder ini
- `index.html` — shell app: splash screen, iframe ke app GAS, tombol Install
- `manifest.json` — nama app, icon, warna, `display: standalone`
- `service-worker.js` — cache shell saja (bukan data POS, biar data selalu real-time)
- `icons/` — icon 192/512/512-maskable/apple-touch-icon (warna brand #2563EB)

## Cara pasang (5 menit)
1. Deploy GAS kamu seperti biasa (Deploy > New deployment > Web app), copy URL `.../exec`.
2. Buka `pwa/index.html`, ganti isi meta tag:
   ```html
   <meta name="gas-exec-url" content="https://script.google.com/macros/s/GANTI_DENGAN_SCRIPT_ID/exec">
   ```
3. Upload folder `pwa/` ke hosting statis HTTPS gratis mana saja, misalnya:
   - GitHub Pages (paling gampang, tinggal push ke repo + aktifkan Pages)
   - Firebase Hosting (`firebase deploy`)
   - Vercel/Netlify (drag & drop folder)
4. Buka URL hosting itu di HP Android/tablet/desktop Chrome → akan muncul
   tombol **"Install Aplikasi"** (atau icon install di address bar desktop).
5. Setelah di-install, app kebuka standalone (tanpa address bar), pakai icon +
   splash screen sendiri, tapi semua data/proses tetap lewat GAS backend asli.

## Batasan yang perlu kamu tahu
- Ini **bukan offline-first** untuk data POS (itu urusan `IndexedDBEngine.html`/
  `SyncQueueEngine.html` kamu yang sudah ada, tidak diubah). Service worker di
  sini cuma bikin shell-nya kebuka cepat & bisa di-install, bukan cache transaksi.
- iOS Safari: install PWA jalan (Share > Add to Home Screen), tapi Apple tidak
  full-support `beforeinstallprompt`, jadi tombol Install custom tidak akan
  muncul di iOS — user install manual lewat menu Share, itu wajar.
- Kalau nanti mau bikin app-nya *benar-benar* offline-capable end-to-end
  (cache seluruh UI, bukan cuma shell), perlu proxy/hosting tambahan di depan
  GAS (Cloudflare Worker dsb) karena origin GAS sendiri tidak bisa diprogram
  bebas seperti server biasa.
