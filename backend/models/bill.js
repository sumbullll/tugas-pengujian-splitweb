'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Bill extends Model {
    static associate(models) {
      // define association here
    }
  }
  Bill.init({
    title: DataTypes.STRING,
    amount: DataTypes.DECIMAL,
    payer_id: DataTypes.INTEGER,
    group_id: DataTypes.INTEGER,
    struk_foto: DataTypes.STRING // Tempat menyimpan nama file struk tagihan
  }, {
    sequelize,
    modelName: 'Bill',
  });
  return Bill;
};