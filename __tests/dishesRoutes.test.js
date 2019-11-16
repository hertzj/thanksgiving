// tests for /api/dishes

// supertest is a module that allows us to test our express server
const request = require('supertest');
const { app } = require('./../server/app.js');
const { db, Dish, Person } = require('./../db/index.js');

beforeEach(async done => {
  // wipe the db before each test block
  await db.sync({ force: true });
  done();
});
afterAll(async done => {
  // close the db connection upon completion of all tests
  await db.close();
  done();
});
describe('/api/dishes routes', () => {
  // its up to you to create the test conditions for /api/dishes
  // add as many tests as you feel necessary to fully cover each routes functionality

  const dish1 = { name: 'broccoli', description: 'delicious damn veggie' };
  const dish2 = { name: 'carrot cake', description: 'overrated. who wants this?' };
  const dish3 = { name: 'turkey', description: 'boring!' };

  describe('GET to /api/dishes', () => {
    it('should show all dishes if no params are given', async () => {
      try {
        // we need some data!
        await Promise.all([
          Dish.create(dish1),
          Dish.create(dish2),
          Dish.create(dish3)
        ])

        // let's check that that data is on our server!
        const noParamsDishesResponse = await request(app)
          .get('/api/dishes');
        
        expect(noParamsDishesResponse.statusCode).toBe(200);
        expect(noParamsDishesResponse.headers['content-type']).toEqual(
          expect.stringContaining('json')
        )
        
        const dishes = noParamsDishesResponse.body;
        expect(dishes.length).toBe(3);
        expect(dishes).toEqual(
          expect.arrayContaining([
            expect.objectContaining(dish1),
            expect.objectContaining(dish2),
            expect.objectContaining(dish3)
          ])
        )

      }
      catch (err) {
        fail(err);
      }
      
    });
  });

  describe('GET to /api/dishes/:id', () => {
    it('should show the dish with the given id', async () => {
      try {
        await Promise.all([
          Dish.create(dish1),
          Dish.create(dish2),
          Dish.create(dish3)
        ])

        const dishNum = Math.ceil(Math.random() * 3)

        const singleDishResponse = await request(app)
          .get(`/api/dishes/${dishNum}`);
        
        expect(singleDishResponse.statusCode).toBe(200);
        expect(singleDishResponse.headers['content-type']).toEqual(
          expect.stringContaining('json')
        );

        const singleDish = singleDishResponse.body;
        if (dishNum === 1) expect(singleDish).toEqual([expect.objectContaining(dish1)]);
        else if (dishNum === 2) expect(singleDish).toEqual([expect.objectContaining(dish2)]);
        else if (dishNum === 3) expect(singleDish).toEqual([expect.objectContaining(dish3)]);
      }
      catch (err) {
        fail (err);
      }
      
    });
  });

  describe('POST to /api/dishes/', () => {
    it("should create a new dish and return that dish's info if all required info is given", async () => {
      try {
        const newDish = { name: 'pumpkin pie', description: 'yummy yummy!' };

        const postResponse = await request(app)
          .post('/api/dishes')
          .send(newDish)
          .expect('Content-Type', /json/)
          .expect(200);

        const postedDish = postResponse.body;
        expect(postedDish.length).toBe(1)
        expect(postedDish).toEqual([expect.objectContaining(newDish)])
      }
      catch (err) {
        fail(err);
      }
      
    });
    it("should return status code 400 if missing required info", async () => {
      try {
        const failNewDish = { name: 'stuffing' }

        const failResponse = await request(app)
          .post('/api/dishes')
          .send(failNewDish)
          .expect('Content-Type', /json/)
          .expect(400)
      }
      catch (err) {
        fail(err)
      }
    });
  });

  describe('PUT to /api/dishes/:id', () => {
    it("should update a dish's info", async () => {
      try {
        await Promise.all([
          Dish.create(dish1),
          Dish.create(dish2),
          Dish.create(dish3)
        ]);

        const updatedData = { description: 'hmm, I like this!' };
        const updatedDish = { name: 'carrot cake', description: 'hmm, I like this!' };

        await request(app)
          .put('/api/dishes/2')
          .send(updatedData)
          .expect('Content-Type', /json/)
          .expect(200)

        const checkEditResponse = await request(app)
          .get('/api/dishes/2')

        const editedDish = checkEditResponse.body;
        expect(editedDish).toEqual([expect.objectContaining(updatedDish)])
      }
      catch (err) {
        fail(err);
      }
    });
    it("should return 400 if given an invalid id", async () => {
      const updatedData = { description: 'hmm, I like this!' };
      await request(app)
        .put('/api/dishes/6')
        .send(updatedData)
        .expect(400)
    })
  });

  describe('DELETE to /api/dishes/:id', () => {
    it('delete the dish with the given id', async () => {
      try {
        await Promise.all([
          Dish.create(dish1),
          Dish.create(dish2),
          Dish.create(dish3)
        ]);

        const deleteId = Math.ceil(Math.random() * 3);
        await request(app)
          .delete(`/api/dishes/${deleteId}`);

        const leftOvers = await request(app)
          .get('/api/dishes')
          .expect('Content-Type', /json/)
          .expect(200);

        const leftOverDishes = leftOvers.body;
        expect(leftOverDishes.length).toBe(2);

      }
      catch (err) {
        fail(err);
      }
      
    });
    it("should return 400 if given an invalid id", async() => {
      await request(app)
        .delete('/api/dishes/6')
        .expect(400)
    })
  });
});
