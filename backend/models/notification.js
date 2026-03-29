'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      // define association here
    }
  }
  Notification.init({
    user_id: DataTypes.INTEGER, // Siapa yang menerima notif ini
    title: DataTypes.STRING,    // Judul notif
    message: DataTypes.TEXT,    // Isi pesan notif
    type: {
      type: DataTypes.STRING,
      defaultValue: 'info'      // 'info', 'success', 'warning'
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false       // Udah dibaca atau belum?
    }
  }, {
    sequelize,
    modelName: 'Notification',
  });
  return Notification;
};