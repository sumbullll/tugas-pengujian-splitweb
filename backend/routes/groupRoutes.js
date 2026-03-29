const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middleware/authMiddleware');

// Endpoint untuk mengambil semua grup
router.get('/', authMiddleware, groupController.getUserGroups);

// Endpoint untuk membuat grup baru
router.post('/', authMiddleware, groupController.createGroup);

// Endpoint untuk mengambil detail SATU grup
router.get('/:id', authMiddleware, groupController.getGroupById);

// Endpoint untuk menerima user yang bergabung ke grup
router.post('/:id/join', authMiddleware, groupController.joinGroup);

// 👉 FITUR BARU: Endpoint untuk menghapus grup (Admin)
router.delete('/:id', authMiddleware, groupController.deleteGroup);

// 👉 FITUR BARU: Endpoint untuk keluar dari grup (Anggota)
router.delete('/:id/leave', authMiddleware, groupController.leaveGroup);

module.exports = router;