const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Import middleware untuk memastikan user sudah login
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

// RUTE BARU UNTUK UPDATE WALLET (Wajib pakai authMiddleware)
router.put('/update-wallet', authMiddleware, authController.updateWalletAddress);

module.exports = router;