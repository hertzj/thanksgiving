const Sequelize = require('sequelize');
const { db } = require('../connection');
const { STRING, BOOLEAN } = Sequelize;

const Person = db.define('people', {
    name: {
        type: STRING,
        allowNull: false,
    },
    isAttending: {
        type: BOOLEAN,
        allowNull: false,
    }
});

module.exports = { Person };
