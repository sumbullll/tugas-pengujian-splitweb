const { BillSplit, Bill, Group, Transaction, User } = require('../models');
const { Op } = require('sequelize');

exports.getSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Total Hutang (Hutang saya yang BELUM lunas di BillSplits)
    const totalHutang = await BillSplit.sum('amount', {
      where: { user_id: userId, is_paid: false }
    }) || 0;

    // 2. Total Piutang (Tagihan yang saya bayar, tapi orang lain BELUM bayar ke saya)
    const myBills = await Bill.findAll({ where: { payer_id: userId }, attributes: ['id'] });
    const billIds = myBills.map(b => b.id);
    
    const totalPiutang = await BillSplit.sum('amount', {
      where: { 
        bill_id: billIds, 
        user_id: { [Op.ne]: userId }, // Jangan hitung diri sendiri
        is_paid: false 
      }
    }) || 0;

    // 3. Jumlah Grup Aktif
    const groupCount = await User.findByPk(userId, {
      include: [{ model: Group, as: 'MemberGroups' }]
    });

    // 4. Total Transaksi On-Chain (Cek tabel transactions)
    const onChainCount = await Transaction.count({
      where: { 
        [Op.or]: [{ from_user_id: userId }, { to_user_id: userId }],
        type: 'onchain',
        status: 'confirmed'
      }
    });

    res.json({
      totalHutang,
      totalPiutang,
      groupCount: groupCount.MemberGroups.length,
      onChainCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};