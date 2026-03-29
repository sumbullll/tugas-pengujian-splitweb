'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BillSplit extends Model {
    static associate(models) {
      // define association here
    }
  }
  BillSplit.init({
    bill_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    amount: DataTypes.DECIMAL,
    is_paid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'UNPAID' // Bisa berisi: 'UNPAID', 'PENDING', 'PAID'
    },
    bukti_transfer: DataTypes.STRING // Tempat menyimpan nama file foto bukti transfer
  }, {
    sequelize,
    modelName: 'BillSplit',
  });
  return BillSplit;
};