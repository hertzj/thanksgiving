const { db } = require('./connection');
const { Dish } = require('./models/Dish');
const { Person } = require('./models/Person');

// Create your associations here!
Person.hasMany(Dish, {foreignKey: 'personId'});
Dish.belongsTo(Person, {foreignKey: 'personId'});


const people = [
  { name: 'mark', isAttending: true },
  { name: 'russell', isAttending: false },
  { name: 'ryan', isAttending: true }
];


const dish1 = { name: 'turkey', description: 'delicious briney turkey' };
const dish2 = { name: 'pie', description: 'delicious pumpkiney pie' }



const seed = async () => {
  try {
    // await db.sync({force: true})

    const [mark, russell, ryan] = await Promise.all(people.map(person => Person.create(person)))
  
    const [turk, pie] = await Promise.all([
      Dish.create({...dish1, personId: mark.id}),
      Dish.create({...dish2, personId: ryan.id})
    ]);
  }
  catch (e) {
    console.log('whoops', e.message)
  }



}


module.exports = {
  db,
  Dish,
  Person,
  seed
};
