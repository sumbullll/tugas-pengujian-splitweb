const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator'); // [SECURITY] Import express-validator
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');

// ==========================================
// MIDDLEWARE VALIDASI INPUT TRANSAKSI 
// ==========================================
const validateTransaction = [
  // 1. Nominal harus angka dan tidak boleh minus/nol (mencegah manipulasi saldo)
  body('nominal')
    .isNumeric().withMessage('Nominal harus berupa angka yang valid')
    .custom((value) => value > 0).withMessage('Nominal transaksi tidak boleh minus atau nol!'),
  
  // 2. Alamat wallet crypto wajib diisi
  body('wallet_address')
    .notEmpty().withMessage('Alamat wallet penerima tidak boleh kosong')
    .isLength({ min: 10 }).withMessage('Format alamat wallet terlalu pendek/tidak valid'),

  // 3. Eksekusi pengecekan
  (req, res, next) => {
    const errors = validationResult(req);
    // Jika ada input yang melanggar aturan di atas, tolak request!
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validasi transaksi gagal, potensi manipulasi data',
        errors: errors.array() 
      });
    }
    next(); // Jika aman, lanjutkan ke proses berikutnya
  }
];
// ==========================================

// Route bawaan Anda sebelumnya
router.get('/history', authMiddleware, transactionController.getUserHistory);
router.delete('/history', authMiddleware, transactionController.deleteAllHistory);

// 👉 FITUR BARU: Endpoint simulasi untuk membuat transaksi/patungan baru (Dengan Validasi Keamanan)
// Rute ini bisa langsung Anda tembak di Postman untuk bahan screenshot laporan!
router.post('/create', validateTransaction, (req, res) => {
  res.status(200).json({ success: true, message: "Data valid! Transaksi berhasil diproses." });
});

module.exports = router;