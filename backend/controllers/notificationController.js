const { Notification } = require('../models');

// Ambil semua notifikasi untuk user yang sedang login
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.findAll({
      where: { user_id: userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Tandai notifikasi sudah dibaca
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({ where: { id, user_id: userId } });
    if (!notification) return res.status(404).json({ message: 'Notifikasi tidak ditemukan' });

    notification.is_read = true;
    await notification.save();

    res.json({ message: 'Notifikasi dibaca' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Fitur Sapu Bersih Semua Notifikasi
exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await Notification.destroy({
      where: { user_id: userId }
    });

    res.json({ message: 'Semua riwayat notifikasi berhasil dibersihkan!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};