const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../models');

// 👉 SETUP MULTER UNTUK UPLOAD FOTO
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Otomatis membuat folder 'uploads' jika belum ada di server
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// Konfigurasi penyimpanan foto
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, 'bukti-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });


// ==========================================
// RUTE UTAMA TAGIHAN
// ==========================================

// 👉 PERBAIKAN FATAL: Harus ada upload.single('struk_foto') di sini!
router.post('/', authMiddleware, upload.single('struk_foto'), billController.createBill);

// Route untuk mengambil daftar tagihan di grup tertentu
router.get('/group/:groupId', authMiddleware, billController.getGroupBills);

// Route untuk melihat detail rincian siapa berhutang siapa
router.get('/:id', authMiddleware, billController.getBillDetails);

// Route untuk mengubah status hutang menjadi lunas - MANUAL/CASH (Lama)
router.put('/split/:splitId/pay', authMiddleware, billController.markAsPaid);

// Route untuk mengubah status hutang menjadi lunas - VIA CRYPTO (METAMASK)
router.put('/split/:splitId/pay-onchain', authMiddleware, billController.payOnChain);


// ==========================================
// FITUR APPROVAL BAYAR CASH (MAKER - CHECKER)
// ==========================================

// 1. User A (Yang Ngutang) kirim BUKTI FOTO ATAU User B (Admin) langsung lunasin
router.post('/:splitId/request-confirm', authMiddleware, upload.single('bukti_transfer'), async (req, res) => {
  try {
    const { splitId } = req.params;
    const userId = req.user.id;

    const split = await db.BillSplit.findByPk(splitId);
    if (!split) return res.status(404).json({ message: "Tagihan tidak ditemukan di database." });

    const bill = await db.Bill.findByPk(split.bill_id);

    // SKENARIO 1: Admin langsung klik Lunas
    if (userId === bill.payer_id) {
      split.status = 'PAID';
      split.is_paid = true;
      await split.save();
      
      // Catat ke History jika Admin yang melunaskan langsung
      try {
        await db.Transaction.create({
            from_user_id: split.user_id,
            to_user_id: bill.payer_id,
            amount_idr: split.amount,
            type: 'cash',
            status: 'confirmed',
            bill_id: bill.id
        });
      } catch (err) { console.log("Skip error log transaction:", err.message); }

      return res.json({ message: "Sebagai Pemberi Dana, kamu langsung melunasi tagihan ini!", split });
    }

    // SKENARIO 2: Si Pengutang upload bukti transfer
    if (split.user_id === userId) {
      if (split.is_paid) return res.status(400).json({ message: "Tagihan ini sudah lunas!" });
      
      split.status = 'PENDING';
      
      // Jika user mengunggah foto, simpan nama fotonya ke database
      if (req.file) {
          split.bukti_transfer = req.file.filename;
      }

      await split.save();

      // 👉 PELATUK 3: Kirim notif ke Admin minta di-ACC
      try {
        await db.Notification.create({
            user_id: bill.payer_id,
            title: 'Minta ACC Pembayaran 📸',
            message: `Ada yang mengirim bukti transfer manual untuk tagihan "${bill.title}". Tolong dicek ya!`,
            type: 'info'
        });
      } catch (err) {
        console.log("⚠️ Gagal kirim notif minta ACC:", err.message);
      }

      return res.json({ message: "Berhasil diajukan. Tunggu konfirmasi penerima ya!", split });
    }

    return res.status(403).json({ message: "Kamu tidak punya akses ke tagihan ini!" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. User B (Yang Nalangin) klik "Terima Pembayaran"
router.post('/:splitId/approve', authMiddleware, async (req, res) => {
  try {
    const { splitId } = req.params;
    const userId = req.user.id;

    const split = await db.BillSplit.findByPk(splitId);
    if (!split) return res.status(404).json({ message: "Tagihan tidak ditemukan" });

    const bill = await db.Bill.findByPk(split.bill_id);
    
    if (bill.payer_id !== userId) {
      return res.status(403).json({ message: "Akses Ditolak: Hanya penerima dana yang bisa melakukan konfirmasi." });
    }

    // SAHKAN LUNAS
    split.status = 'PAID';
    split.is_paid = true;
    await split.save();

    // Catat ke buku Riwayat Transaksi (History)
    try {
        await db.Transaction.create({
            from_user_id: split.user_id,
            to_user_id: bill.payer_id,
            amount_idr: split.amount, 
            type: 'cash',             
            status: 'confirmed',
            bill_id: bill.id,
            bukti_foto: split.bukti_transfer 
        });
    } catch (txErr) {
        console.log("⚠️ Gagal mencatat transaksi:", txErr.message);
    }

    // 👉 PELATUK 4: Kirim notif ke yang ngutang kalau pembayarannya di-ACC
    try {
        await db.Notification.create({
            user_id: split.user_id,
            title: 'Pembayaran Di-ACC! 🎉',
            message: `Hore! Pembayaranmu untuk tagihan "${bill.title}" sudah disahkan. Hutangmu LUNAS!`,
            type: 'success'
        });
    } catch (err) {
        console.log("⚠️ Gagal kirim notif lunas:", err.message);
    }

    res.json({ message: "Pembayaran berhasil dikonfirmasi. Status LUNAS!", split });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;