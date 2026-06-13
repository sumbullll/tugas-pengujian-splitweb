const { Group, GroupMember, User, Bill, BillSplit } = require('../models');

// 1. Buat Grup Baru
exports.createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    const admin_id = req.user.id; 

    // [TAMBAHAN VALIDASI UNTUK JEST]
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Nama grup wajib diisi' });
    }
    // ============================

    const newGroup = await Group.create({
      name,
      description,
      admin_id,
      qr_code: 'temp' 
    });

    newGroup.qr_code = `splitweb3.app/join/${newGroup.id}`;
    await newGroup.save();

    await GroupMember.create({
      group_id: newGroup.id,
      user_id: admin_id
    });

    res.status(201).json({ message: 'Grup berhasil dibuat!', group: newGroup });
  } catch (error) {
    console.error("❌ ERROR CREATE GROUP:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 2. Ambil Semua Grup
exports.getUserGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    const memberships = await GroupMember.findAll({
      where: { user_id: userId },
      attributes: ['group_id']
    });

    const groupIds = memberships.map(m => m.group_id);
    const groups = await Group.findAll({
      where: { id: groupIds },
      order: [['createdAt', 'DESC']]
    });

    res.json(groups);
  } catch (error) {
    console.error("❌ ERROR GET GROUPS:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 3. Ambil Detail Satu Grup (Fungsi yang dipanggil saat grup diklik)
exports.getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const group = await Group.findByPk(id);
    if (!group) return res.status(404).json({ message: 'Grup tidak ditemukan' });

    const memberships = await GroupMember.findAll({ where: { group_id: id } });
    const userIds = memberships.map(m => m.user_id);

    const members = await User.findAll({
      where: { id: userIds },
      attributes: ['id', 'name', 'email', 'wallet_address'] 
    });

    res.json({ group, members });
  } catch (error) {
    console.error("❌ ERROR GET GROUP DETAIL:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 4. Join Grup (Bergabung ke dalam grup)
exports.joinGroup = async (req, res) => {
  try {
    const { id } = req.params; // ID grup dari URL
    const userId = req.user.id; // ID user dari token (yang sedang login)

    // Cek apakah grupnya memang ada
    const group = await Group.findByPk(id);
    if (!group) return res.status(404).json({ message: 'Grup tidak ditemukan' });

    // Cek apakah user ini sudah pernah bergabung sebelumnya
    const existingMember = await GroupMember.findOne({
      where: { group_id: id, user_id: userId }
    });

    if (existingMember) {
      return res.status(400).json({ message: 'Kamu sudah menjadi anggota grup ini' });
    }

    // Eksekusi: Masukkan user ke dalam grup
    await GroupMember.create({
      group_id: id,
      user_id: userId
    });

    res.json({ message: 'Berhasil bergabung dengan grup!' });
  } catch (error) {
    console.error("❌ ERROR JOIN GROUP:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 👉 5. FITUR BARU: Hapus Grup (KHUSUS ADMIN)
exports.deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const group = await Group.findByPk(id);
    if (!group) return res.status(404).json({ message: 'Grup tidak ditemukan' });

    // Validasi: Hanya admin yang boleh membubarkan grup
    if (group.admin_id !== userId) {
      return res.status(403).json({ message: 'Akses Ditolak: Hanya Admin yang bisa menghapus grup ini.' });
    }

    // Bersihkan dulu semua anggota dari grup ini
    await GroupMember.destroy({ where: { group_id: id } });
    
    // Hapus grupnya
    await group.destroy();

    res.json({ message: 'Grup berhasil dibubarkan dan dihapus!' });
  } catch (error) {
    console.error("❌ ERROR DELETE GROUP:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 👉 6. FITUR BARU: Keluar Grup (UNTUK ANGGOTA BUKAN ADMIN)
exports.leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const group = await Group.findByPk(id);
    if (!group) return res.status(404).json({ message: 'Grup tidak ditemukan' });

    // Validasi: Admin tidak boleh asal keluar, harus hapus grup
    if (group.admin_id === userId) {
      return res.status(400).json({ message: 'Kamu adalah Admin grup ini. Jika ingin keluar, silakan Hapus/Bubarkan grup.' });
    }

    // Eksekusi: Keluarkan user dari tabel GroupMembers
    const deleted = await GroupMember.destroy({
      where: { group_id: id, user_id: userId }
    });

    if (deleted) {
      res.json({ message: 'Kamu berhasil keluar dari grup.' });
    } else {
      res.status(400).json({ message: 'Kamu tidak terdaftar di grup ini.' });
    }
  } catch (error) {
    console.error("❌ ERROR LEAVE GROUP:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};