const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    // ALARM DETEKSI: Ini akan mencetak data yang dikirim React ke terminal
    console.log("🔔 ADA REQUEST REGISTER MASUK! Data:", req.body); 

    const { name, email, password } = req.body;

    // Cek apakah email sudah terdaftar
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      console.log("⚠️ Email sudah digunakan:", email);
      return res.status(400).json({ message: 'Email sudah digunakan' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan user baru
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    console.log("✅ User berhasil dibuat:", newUser.email);
    res.status(201).json({ message: 'User berhasil didaftarkan', userId: newUser.id });
  } catch (error) {
    console.error("❌ ERROR REGISTRASI:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    console.log("🔔 ADA REQUEST LOGIN MASUK! Email:", req.body.email);

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Email atau password salah' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email atau password salah' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'rahasia', 
      { expiresIn: '1d' }
    );

    console.log("✅ Login berhasil:", email);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, wallet: user.wallet_address }
    });
  } catch (error) {
    console.error("❌ ERROR LOGIN:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// =========================================================
// FUNGSI BARU: SIMPAN ALAMAT WALLET METAMASK KE DATABASE
// =========================================================
exports.updateWalletAddress = async (req, res) => {
  try {
    const { wallet_address } = req.body;
    const userId = req.user.id; // ID didapat dari token login (authMiddleware)

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

    user.wallet_address = wallet_address;
    await user.save();

    console.log(`🦊 Wallet user ${user.name} berhasil disimpan: ${wallet_address}`);
    res.json({ message: 'Alamat wallet berhasil diperbarui!', wallet_address });
  } catch (error) {
    console.error("❌ ERROR UPDATE WALLET:", error);
    res.status(500).json({ message: 'Gagal update wallet', error: error.message });
  }
};