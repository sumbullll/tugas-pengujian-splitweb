const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Ubah kondisi IF ini
  if (process.env.BYPASS_AUTH === 'true') {
    req.user = { id: 1 }; // User palsu agar backend tidak error
    return next();
  }
  // ==========================================

  // Logika asli milikmu untuk mendeteksi token pengguna asli
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Akses ditolak, token tidak ditemukan' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token tidak valid' });
  }
};

module.exports = authMiddleware;