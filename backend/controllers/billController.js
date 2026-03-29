const { Bill, BillSplit, GroupMember, User, Transaction, Notification } = require('../models');

// 1. Buat Tagihan Baru & Bagi Rata (Split Bill)
exports.createBill = async (req, res) => {
  try {
    const group_id = req.body.group_id;
    const title = req.body.title;
    const amount = req.body.amount;
    
    let split_members = req.body.split_members;
    if (typeof split_members === 'string') {
        try {
            split_members = JSON.parse(split_members);
        } catch (e) {
            split_members = split_members.split(',').map(id => id.trim());
        }
    }

    const payer_id = req.user.id; 

    if (!group_id || !title || !amount || !split_members || split_members.length === 0) {
      return res.status(400).json({ message: 'Data tagihan tidak lengkap!' });
    }

    let struk_foto = null;
    if (req.file) {
        struk_foto = req.file.filename; 
    }

    const newBill = await Bill.create({
      title,
      amount,
      payer_id,
      group_id,
      struk_foto 
    });

    const splitAmount = amount / split_members.length;

    const splitData = split_members.map(user_id => {
      const isPayer = parseInt(user_id, 10) === payer_id;
      return {
        bill_id: newBill.id,
        user_id: parseInt(user_id, 10),
        amount: splitAmount,
        is_paid: isPayer, 
        status: isPayer ? 'PAID' : 'UNPAID' 
      };
    });

    await BillSplit.bulkCreate(splitData);

    try {
      const notifData = split_members
        .filter(id => parseInt(id, 10) !== payer_id) 
        .map(user_id => ({
          user_id: parseInt(user_id, 10),
          title: 'Tagihan Baru! 💸',
          message: `Kamu diajak patungan "${title}" sebesar Rp ${parseInt(splitAmount).toLocaleString('id-ID')}. Buruan cek grup!`,
          type: 'warning'
        }));
      
      if(notifData.length > 0) {
          await Notification.bulkCreate(notifData);
      }
    } catch (notifErr) { 
        console.log("⚠️ Gagal kirim notif tagihan baru:", notifErr.message); 
    }

    res.status(201).json({ 
      message: 'Tagihan beserta foto struk berhasil dibuat dan dibagi!', 
      bill: newBill 
    });
  } catch (error) {
    console.error("❌ ERROR CREATE BILL:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 2. Ambil Semua Tagihan di Dalam Satu Grup
exports.getGroupBills = async (req, res) => {
  try {
    const { groupId } = req.params;
    const bills = await Bill.findAll({
      where: { group_id: groupId },
      order: [['createdAt', 'DESC']]
    });
    res.json(bills);
  } catch (error) {
    console.error("❌ ERROR GET BILLS:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 3. Ambil Detail Rincian Satu Tagihan
exports.getBillDetails = async (req, res) => {
  try {
    const { id } = req.params; 
    const bill = await Bill.findByPk(id);
    if (!bill) return res.status(404).json({ message: 'Tagihan tidak ditemukan' });

    const payer = await User.findByPk(bill.payer_id, { attributes: ['name'] });
    const splits = await BillSplit.findAll({ where: { bill_id: id } });
    
    const userIds = splits.map(s => s.user_id);
    const users = await User.findAll({ where: { id: userIds }, attributes: ['id', 'name'] });

    const splitDetails = splits.map(split => {
      const user = users.find(u => u.id === split.user_id);
      return {
        ...split.toJSON(),
        user_name: user ? user.name : 'Unknown'
      };
    });

    res.json({
      bill: { ...bill.toJSON(), payer_name: payer ? payer.name : 'Unknown' },
      splits: splitDetails
    });
  } catch (error) {
    console.error("❌ ERROR GET BILL DETAILS:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 4. Tandai Lunas (Manual/Cash)
exports.markAsPaid = async (req, res) => {
  try {
    const { splitId } = req.params;
    const split = await BillSplit.findByPk(splitId);
    if (!split) return res.status(404).json({ message: 'Data rincian tidak ditemukan' });

    split.is_paid = true;
    await split.save();

    res.json({ message: 'Hutang berhasil ditandai lunas!', split });
  } catch (error) {
    console.error("❌ ERROR MARK PAID:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 👉 5. PAY ON CHAIN (DIPERBAIKI DENGAN RADAR LOG & TIPE DATA AMAN)
exports.payOnChain = async (req, res) => {
  console.log(`📡 [RADAR] Request PUT /pay-onchain masuk untuk splitId: ${req.params.splitId}`);
  
  try {
    const { splitId } = req.params; 
    const { tx_hash } = req.body;   
    const userId = req.user.id;     

    const split = await BillSplit.findByPk(splitId);
    if (!split) {
      console.log("❌ Akses Ditolak: Rincian split tidak ditemukan di DB.");
      return res.status(404).json({ message: 'Rincian tagihan tidak ditemukan' });
    }

    // 👉 PERBAIKAN FATAL: Memaksa kedua data menjadi Number agar tidak terjadi "Silent Error"
    if (Number(split.user_id) !== Number(userId)) {
      console.log(`❌ Akses Ditolak: User ID tidak cocok. Split punya ${split.user_id}, tapi yang login ${userId}`);
      return res.status(403).json({ message: 'Akses ditolak. Ini bukan hutang Anda.' });
    }

    const bill = await Bill.findByPk(split.bill_id);
    if (!bill) {
      console.log("❌ Akses Ditolak: Tagihan utama tidak ditemukan.");
      return res.status(404).json({ message: 'Tagihan utama tidak ditemukan' });
    }

    // SAHKAN STATUS LUNAS!
    split.is_paid = true;
    split.status = 'PAID'; 
    await split.save();
    console.log("✅ Status Split berhasil diubah menjadi LUNAS (PAID)!");

    // Catat di tabel Transaksi
    try {
      if (tx_hash && Transaction) {
        await Transaction.create({
          from_user_id: userId,
          to_user_id: bill.payer_id,
          amount_idr: split.amount, 
          type: 'onchain',
          tx_hash: tx_hash,
          status: 'confirmed',
          bill_id: bill.id          
        });
        console.log("✅ Log transaksi On-Chain berhasil dibuat!");
      }
    } catch (txError) {
      console.log("⚠️ Info: Gagal mencatat log Transaksi (Cek tabel Transaction di DB):", txError.message);
    }

    // Kirim notif
    try {
        await Notification.create({
            user_id: bill.payer_id,
            title: 'Pembayaran Crypto Masuk! 🚀',
            message: `Ada pembayaran via Web3/MetaMask masuk untuk tagihan "${bill.title}". Cek dompetmu!`,
            type: 'success'
        });
    } catch (notifErr) {
        console.log("⚠️ Gagal kirim notif crypto:", notifErr.message);
    }

    res.json({ 
      message: 'Pembayaran On-Chain berhasil dikonfirmasi!', 
      tx_hash: tx_hash 
    });

  } catch (error) {
    console.error("❌ ERROR PAY ON-CHAIN:", error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};