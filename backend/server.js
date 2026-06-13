require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet'); // [SECURITY] Import Helmet
const rateLimit = require('express-rate-limit'); // [SECURITY] Import Rate Limit
const db = require('./models');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const billRoutes = require('./routes/billRoutes'); 
const dashboardRoutes = require('./routes/dashboardRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// ==========================================
// MIDDLEWARE KEAMANAN
// ==========================================
// 1. Helmet: Mengamankan HTTP headers dari celah XSS dan menyembunyikan identitas framework
app.use(helmet());

// 2. Rate Limit: Mencegah serangan Brute Force / DDoS pada aplikasi Split Bill
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Jendela waktu 15 menit
  max: 100, // Batasi setiap IP maksimal 100 request per 15 menit
  message: {
    success: false,
    message: 'Terlalu banyak request dari IP ini, silakan coba lagi setelah 15 menit.'
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});
// Mengaplikasikan pembatasan ke semua rute
app.use(apiLimiter);
// ==========================================

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 📡 Middleware Radar Logs (Biar gampang lacak error di terminal)
app.use((req, res, next) => {
  console.log(`[RADAR] Request masuk: ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/notifications', notificationRoutes);

// Halaman Utama (Cek Status)
app.get('/', (req, res) => {
  res.send('🚀 SplitWeb3 API is Running Online!');
});

// Koneksi Database
db.sequelize.sync()
  .then(() => console.log('✅ DB Connected'))
  .catch((err) => console.error('❌ DB Error:', err.message));

// ==========================================
// MESIN STANDBY (Biar terminal nggak "Clean Exit")
// ==========================================
const PORT = process.env.PORT || 5000;

// Vercel akan mengabaikan ini, tapi localhost akan menyalakannya
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server Lokal Nyala di http://localhost:${PORT}`);
  });
}

// Export untuk Vercel
module.exports = app;