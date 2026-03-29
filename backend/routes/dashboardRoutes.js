const express = require('express');
const router = express.Router();
const db = require('../models');
const { QueryTypes } = require('sequelize');

const authMiddleware = require('../middleware/authMiddleware');

router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Hitung Total Hutang
    const hutangResult = await db.sequelize.query(`
      SELECT SUM(s.amount) as total_hutang 
      FROM BillSplits s
      JOIN Bills b ON s.bill_id = b.id
      WHERE s.user_id = :userId 
      AND s.is_paid = false 
      AND b.payer_id != :userId
    `, {
      replacements: { userId },
      type: QueryTypes.SELECT
    });

    // 2. Hitung Total Piutang
    const piutangResult = await db.sequelize.query(`
      SELECT SUM(s.amount) as total_piutang
      FROM BillSplits s
      JOIN Bills b ON s.bill_id = b.id
      WHERE b.payer_id = :userId 
      AND s.user_id != :userId 
      AND s.is_paid = false
    `, {
      replacements: { userId },
      type: QueryTypes.SELECT
    });

    // 3. Hitung Jumlah Transaksi On-Chain (Ambil dari tabel Transactions, BUKAN BillSplits!)
    const onChainResult = await db.sequelize.query(`
      SELECT COUNT(*) as tx_count
      FROM Transactions
      WHERE tx_hash IS NOT NULL
      AND (from_user_id = :userId OR to_user_id = :userId)
    `, {
      replacements: { userId },
      type: QueryTypes.SELECT
    });

    // 4. Ambil Daftar Hutang Mendesak
    const urgentResult = await db.sequelize.query(`
      SELECT b.title as bill_title, s.amount, u.name as payer_name, b.group_id
      FROM BillSplits s
      JOIN Bills b ON s.bill_id = b.id
      JOIN Users u ON b.payer_id = u.id
      WHERE s.user_id = :userId 
      AND s.is_paid = false 
      AND b.payer_id != :userId
      ORDER BY b.createdAt ASC
      LIMIT 3
    `, {
      replacements: { userId },
      type: QueryTypes.SELECT
    });

    // Kirim data rangkuman ke Frontend
    res.json({
      totalHutang: hutangResult[0]?.total_hutang || 0,
      totalPiutang: piutangResult[0]?.total_piutang || 0,
      onChainCount: onChainResult[0]?.tx_count || 0,
      urgentDebts: urgentResult || []
    });

  } catch (error) {
    console.error("❌ Gagal mengambil summary dashboard:", error.message);
    res.status(500).json({ error: "Terjadi kesalahan saat memuat data Dashboard." });
  }
});

module.exports = router;