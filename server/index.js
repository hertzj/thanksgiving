const { app } = require("./app");
const PORT = 3000;
const { db } = require("../db");
const { seed } = require('../db/index.js'); // I added this

/*
  DO NOT TOUCH THIS FILE
*/

db.sync({ force: true })
  .then(() => seed()) // this line gets the server going so I can test manually
  .then(() => {
  app.listen(PORT, () => {
    console.log("listenin");
  });
});

