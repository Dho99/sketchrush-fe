# Frontend — Realtime Drawing Guessing Game (SketchRush)

## Overview
Frontend SketchRush adalah aplikasi web interaktif berbasis React yang memungkinkan pengguna untuk bermain game tebak gambar secara realtime. Aplikasi ini menangani antarmuka menggambar pada canvas, komunikasi dua arah melalui Socket.IO, manajemen state permainan, dan visualisasi sistem replay.

## Features
Berdasarkan analisis source code, berikut adalah fitur utama yang diimplementasikan:
- **Realtime Drawing Interface**: Kanvas interaktif dengan dukungan *brush size*, berbagai pilihan warna, serta fitur *undo* dan *clear*.
- **Multiplayer Room UI**: Antarmuka untuk membuat, bergabung, dan mengelola ruang permainan (lobby).
- **Realtime Guessing/Chat**: Sistem chat yang membedakan pesan biasa, tebakan benar (correct guess), dan pesan sistem.
- **Scoreboard & Leaderboard**: Tampilan skor pemain secara realtime yang diperbarui setiap akhir ronde.
- **Replay Drawing Visualization**: Kemampuan untuk melihat kembali proses menggambar setelah ronde atau permainan selesai.
- **AI Clue Display**: Menampilkan petunjuk cerdas yang dihasilkan oleh AI (Gemini) di backend.
- **Responsive Layout**: Desain antarmuka yang menyesuaikan dengan berbagai ukuran layar menggunakan Tailwind CSS.
- **Floating Emotes**: Fitur ekspresi pemain menggunakan emote yang mengapung di layar.

## Tech Stack
Aplikasi frontend ini dibangun dengan stack teknologi modern:
- **React (Vite)**: Framework utama untuk UI dan build tool yang cepat.
- **Tailwind CSS v4**: Framework CSS untuk styling yang efisien dan responsif.
- **shadcn/ui (Radix UI)**: Koleksi komponen UI yang aksesibel dan mudah di-custom.
- **Socket.IO Client**: Library untuk komunikasi realtime dengan server.
- **Zustand**: State management yang ringan dan efisien untuk mengelola status permainan global.
- **Framer Motion**: Library untuk animasi transisi dan interaksi UI yang halus.
- **Lucide React**: Set ikon vektor yang konsisten di seluruh aplikasi.

## Frontend Architecture
Arsitektur frontend SketchRush dirancang untuk menangani beban data realtime:
- **Component-Based**: UI dipecah menjadi komponen modular (misal: `DrawingCanvas`, `ChatPanel`, `Scoreboard`).
- **Store-Driven State**: Menggunakan `zustand` (`game-store.ts`) sebagai sumber kebenaran (source of truth) untuk state game, pemain, dan pesan.
- **Socket Hook Abstraction**: Logika socket dibungkus dalam custom hooks (`useSocketGame`, `useSocketRoom`) untuk memisahkan logika komunikasi dari komponen UI.
- **Service Layer**: Menggunakan `api-client.ts` untuk komunikasi HTTP dan `socket.service.ts` sebagai singleton untuk koneksi WebSocket.

## Folder Structure
```bash
frontend/
├── src/
│   ├── app/
│   │   ├── components/       # Komponen UI modular
│   │   ├── pages/            # View utama (Home, Lobby, Game)
│   │   ├── App.tsx           # Root component
│   │   └── routes.tsx        # Konfigurasi routing
│   ├── hooks/                # Custom hooks (Socket, Audio, dll)
│   ├── lib/                  # Utilitas, tipe data, dan konfigurasi socket
│   ├── services/             # API client dan auth service
│   ├── store/                # Zustand stores (game, auth, audio)
│   └── styles/               # File CSS dan konfigurasi tema
├── public/                   # Asset statis (sounds, images)
└── ...
```

## Important Files
- `src/app/components/DrawingCanvas.tsx`: Inti dari sistem menggambar menggunakan HTML5 Canvas API.
- `src/store/game-store.ts`: Pengelola state utama permainan termasuk pemain, ronde, dan goresan gambar.
- `src/lib/socket.ts`: Inisialisasi dan manajemen koneksi Socket.IO client.
- `src/hooks/useSocketGame.ts`: Menangani event game spesifik seperti mulai ronde, tebakan, dan hasil akhir.

## Realtime Flow
1. **Connection**: Frontend membuka koneksi ke backend saat aplikasi dimuat atau saat bergabung ke room.
2. **Drawing**: Saat pemain menggambar, koordinat dikirim secara *throttled* melalui event `draw:stroke`.
3. **Receiving**: Pemain lain menerima stroke tersebut dan menggambarnya kembali di canvas masing-masing secara instan.
4. **Guessing**: Input teks dikirim melalui `chat:message`, backend memvalidasi, dan mengirim balik event `round:correctGuess` jika benar.
5. **Replay**: Setelah ronde berakhir, data stroke yang disimpan di database diambil dan divisualisasikan kembali menggunakan `ReplayModal.tsx`.

## Socket.IO Events (Client-Side)
| Event | Arah | Deskripsi |
|-------|------|-----------|
| `room:join` | Emit | Bergabung ke ruang permainan tertentu. |
| `draw:stroke` | Emit/On | Mengirim atau menerima data goresan gambar. |
| `chat:message` | Emit/On | Mengirim pesan chat atau tebakan. |
| `round:start` | On | Menerima informasi awal ronde (kata rahasia jika penggambar). |
| `round:end` | On | Menerima hasil akhir ronde dan jawaban yang benar. |
| `game:end` | On | Menerima hasil akhir seluruh permainan. |

## Canvas Drawing System
Implementasi sistem menggambar:
- **Internal Resolution**: 800x550 piksel, yang diskalakan sesuai container UI.
- **Smoothing**: Menggunakan `quadraticCurveTo` untuk menghasilkan garis yang halus (tidak patah-patah).
- **Optimization**: Penggunaan `throttle` dari lodash untuk membatasi jumlah data yang dikirim per detik agar performa tetap terjaga.
- **Tools**: Mendukung `pencil`, `eraser`, `undo`, dan `clear`.

## State Management
Menggunakan **Zustand** untuk mengelola:
- **Room State**: Kode room, daftar pemain, dan status host.
- **Game Status**: Apakah sedang di lobby, bermain, atau melihat hasil.
- **Round State**: Timer, petunjuk kata, dan siapa penggambar saat ini.
- **Messages**: Riwayat chat dan notifikasi sistem.

## Environment Variables
Buat file `.env` di folder `frontend/`:
```env
VITE_API_BASE_URL=http://localhost:3000
```

## Running Locally
```bash
# Install dependencies
npm install

# Jalankan dalam mode development
npm run dev

# Build untuk produksi
npm run build
```

## Build & Deployment
- **Build**: Menghasilkan folder `dist` menggunakan Vite.
- **Deployment**: Dapat di-deploy ke Vercel atau platform statis lainnya. Pastikan variabel lingkungan `VITE_API_BASE_URL` mengarah ke server backend yang aktif.

## Known Limitations
- Koneksi socket sangat bergantung pada stabilitas jaringan; latensi tinggi dapat menyebabkan gambar terlihat tersendat.
- Saat ini belum mendukung input dari touch device secara maksimal (tablet/mobile).

## Future Improvements
- Optimasi performa canvas menggunakan WebGL untuk gambar yang lebih kompleks.
- Dukungan untuk berbagai jenis brush (texture, opacity).
- Sistem pre-loading sounds untuk pengalaman audio yang lebih lancar.

## Conclusion
Frontend SketchRush menyediakan pengalaman realtime yang responsif dengan arsitektur yang memisahkan logika bisnis (state) dari representasi visual (components). Penggunaan Socket.IO dan HTML5 Canvas menjadi tulang punggung dari interaksi menggambar yang menjadi inti permainan ini.
