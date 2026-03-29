'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {
      // define association here
    }
  }
  Transaction.init({
    from_user_id: DataTypes.INTEGER,
    to_user_id: DataTypes.INTEGER,
    amount_idr: DataTypes.DECIMAL,
    amount_eth: DataTypes.DECIMAL, // Akan terisi jika pakai MetaMask
    tx_hash: DataTypes.STRING,     // Akan terisi jika pakai MetaMask
    bukti_foto: DataTypes.STRING,  // Untuk simpan bukti transfer cash
    status: DataTypes.STRING,      // 'confirmed' atau 'pending'
    bill_id: DataTypes.INTEGER,
    // 👉 TAMBAHAN: Untuk membedakan di UI nanti ini Cash atau MetaMask
    type: {
      type: DataTypes.STRING,
      defaultValue: 'cash' // 'cash' atau 'onchain'
    }
  }, {
    sequelize,
    modelName: 'Transaction',
  });
  return Transaction;
};