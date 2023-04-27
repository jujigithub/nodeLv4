"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Likes", "createdAt", {
      allowNull: false, // NOT NULL
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn("now"),
    });

    await queryInterface.addColumn("Likes", "updatedAt", {
      allowNull: false, // NOT NULL
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn("now"),
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
