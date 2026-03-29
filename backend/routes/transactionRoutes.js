const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');

// Route untuk mengambil riwayat transaksi user yang login
router.get('/history', authMiddleware, transactionController.getUserHistory);

// 👉 FITUR BARU: Endpoint untuk menghapus semua riwayat transaksi
router.delete('/history', authMiddleware, transactionController.deleteAllHistory);

module.exports = router;