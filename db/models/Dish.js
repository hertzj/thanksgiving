const Sequelize = require('sequelize');
const { db } = require('../connection');
const { STRING } = Sequelize;

const Dish = db.define('dishes', {
    name: {
        type: STRING,
        allowNull: false,
    },
    description: {
        type: STRING,
        allowNull: false,
    }
});

module.exports = { Dish };
