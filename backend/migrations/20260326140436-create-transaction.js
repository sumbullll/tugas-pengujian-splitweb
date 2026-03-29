'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      from_user_id: {
        type: Sequelize.INTEGER
      },
      to_user_id: {
        type: Sequelize.INTEGER
      },
      amount_idr: {
        type: Sequelize.DECIMAL
      },
      amount_eth: {
        type: Sequelize.DECIMAL
      },
      tx_hash: {
        type: Sequelize.STRING
      },
      bukti_foto: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      bill_id: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Transactions');
  }
};