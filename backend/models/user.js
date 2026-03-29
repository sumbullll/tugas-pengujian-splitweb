'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here jika ada (misal: relasi ke tabel Group)
    }
  }
  
  User.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // Mencegah email kembar di level database
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    wallet_address: {
      type: DataTypes.STRING,
      allowNull: true // Boleh kosong saat baru daftar
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users', // Memastikan nama tabelnya persis 'Users'
  });
  
  return User;
};