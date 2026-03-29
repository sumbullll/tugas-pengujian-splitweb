const { Transaction, User } = require('../models');
const { Op } = require('sequelize');

exports.getUserHistory = async (req, res) => {
  try {
    const userId = req.user.id; // User yang lagi login

    // Ambil semua transaksi di mana user ini sebagai PENGIRIM atau PENERIMA
    const transactions = await Transaction.findAll({
      where: {
        [Op.or]: [
          { from_user_id: userId },
          { to_user_id: userId }
        ]
      },
      order: [['createdAt', 'DESC']] // Urutkan dari yang terbaru
    });

    // Ambil data nama user agar di React gampang menampilkannya
    const users = await User.findAll({ attributes: ['id', 'name'] });

    // Gabungkan data transaksi dengan nama Pengirim & Penerima
    const historyData = transactions.map(tx => {
      const fromUser = users.find(u => u.id === tx.from_user_id);
      const toUser = users.find(u => u.id === tx.to_user_id);
      
      return {
        ...tx.toJSON(),
        from_name: fromUser ? fromUser.name : 'Unknown',
        to_name: toUser ? toUser.name : 'Unknown',
        // Tentukan apakah user yang lagi login ini uangnya keluar atau masuk
        is_income: tx.to_user_id === userId
      };
    });

    res.json(historyData);
  } catch (error) {
    console.error("❌ ERROR GET HISTORY:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 👉 FITUR BARU: Sapu Bersih Riwayat Transaksi
exports.deleteAllHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // Menghapus semua transaksi di mana user ini adalah pengirim atau penerima
    await Transaction.destroy({
      where: {
        [Op.or]: [
          { from_user_id: userId },
          { to_user_id: userId }
        ]
      }
    });

    res.json({ message: 'Semua riwayat transaksi berhasil dibersihkan!' });
  } catch (error) {
    console.error("❌ ERROR DELETE HISTORY:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};