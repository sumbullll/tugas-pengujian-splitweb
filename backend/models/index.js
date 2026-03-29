'use strict';

const Sequelize = require('sequelize');
const process = require('process');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// 👉 IMPORT MANUAL (Disesuaikan dengan nama file huruf kecil semua di screenshot kamu)
db.User = require('./user')(sequelize, Sequelize.DataTypes);
db.Group = require('./group')(sequelize, Sequelize.DataTypes);
db.GroupMember = require('./groupmember')(sequelize, Sequelize.DataTypes);
db.Bill = require('./bill')(sequelize, Sequelize.DataTypes);
db.BillSplit = require('./billsplit')(sequelize, Sequelize.DataTypes);
db.Transaction = require('./transaction')(sequelize, Sequelize.DataTypes);
db.Notification = require('./notification')(sequelize, Sequelize.DataTypes);

// JALANKAN ASSOCIATIONS
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;