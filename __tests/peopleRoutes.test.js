// tests for api/people
// npm run test:watch -- --verbose
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
describe('/api/people routes', () => {
  const person1 = { name: 'mark', isAttending: true };
  const person2 = { name: 'russell', isAttending: false };
  const person3 = { name: 'ryan', isAttending: true };

  const dish1 = { name: 'turkey', description: 'delicious briney turkey' };
  const dish2 = { name: 'pie', description: 'delicious pumpkiney pie' };
  describe('GET to /api/people', () => {
    // example test using vanilla promise syntax (no async/await)
    it('should retrieve all people if no params are given', () => {
      // we will seed the db before every test so that we can isolate each test as much as possible
      // NOTE: we are not testing the database itself, just that our api endpoints are giving back the correct data

      // we need to return promises contained inside of jest test blocks
      // in order for jest to know we are dealing with an async test case.
      // if we dont return the promise jest will pass this test block since it will think the there are no assertions.
      return Promise.all([Person.create(person1), Person.create(person2)]).then(
        () => {
          // we wrap our server (app) in request(supertest) so that we can mock it
          // api calls are always async so we need to return them so that jest knows we are dealing with a promise
          return request(app) // have to return this promise as well
            .get('/api/people')
            .expect('Content-Type', /json/) // you can make assertions about the response using supertest's built in methods
            .expect(200) // you should always be sending status codes when sending a response from your server
            .then(response => {
              // once the promise is fulfilled we have access to the entire response
              const people = response.body;
              expect(people.length).toBe(2);
              expect(people).toEqual(
                expect.arrayContaining([
                  expect.objectContaining(person1),
                  expect.objectContaining(person2),
                ])
              );
            })
            .catch(err => {
              fail(err);
            });
        }
      );
    });
    // using async/await
    it('should filter users using the is_attending query string', async () => {
      try {
        // seed the db
        await Promise.all([
          Person.create(person1),
          Person.create(person2),
          Person.create(person3),
        ]);

        // grab the response
        const isAttendingResponse = await request(app).get(
          '/api/people/?is_attending=true'
        );

        // test our assertions
        expect(isAttendingResponse.statusCode).toBe(200);
        expect(isAttendingResponse.headers['content-type']).toEqual(
          expect.stringContaining('json')
        );

        const attendingPeople = isAttendingResponse.body;
        expect(attendingPeople.length).toBe(2);
        expect(attendingPeople).toEqual(
          expect.arrayContaining([
            expect.objectContaining(person1),
            expect.objectContaining(person3),
          ])
        );

        const isNotAttendingResponse = await request(app)
          .get('/api/people/?is_attending=false')
          .expect('Content-Type', /json/) // you can still chain the built in supertest methods if you want when using async/await
          .expect(200);

        const notAttendingPeople = isNotAttendingResponse.body;
        expect(notAttendingPeople).toEqual([expect.objectContaining(person2)]);
      } catch (err) {
        fail(err);
      }
    });

    it('should return users and their Dishes using `include_dishes=true` query string', async () => {
      try {
        const [mark, russell, ryan] = await Promise.all([
          Person.create(person1),
          Person.create(person2),
          Person.create(person3),
        ]);

        const [turk, pie] = await Promise.all([
          Dish.create({ ...dish1, personId: mark.id }),
          Dish.create({ ...dish2, personId: ryan.id }),
        ]);

        // get the response
        const includeDishesResponse = await request(app).get('/api/people/?include_dishes=true')

        // let's do some testing!
        expect(includeDishesResponse.statusCode).toBe(200);
        expect(includeDishesResponse.headers['content-type']).toEqual(
          expect.stringContaining('json')
        );

        const peepsInDishesTrue = includeDishesResponse.body;
        expect(peepsInDishesTrue.length).toBe(3);
        expect(peepsInDishesTrue).toEqual(
          expect.arrayContaining([
            expect.objectContaining(person1),
            expect.objectContaining(person2),
            expect.objectContaining(person3),
          ])
        )

        const peopleWithDishes = []
        peepsInDishesTrue.forEach(person => {
          if (person.dishes.length > 0) {
            peopleWithDishes.push(person)
          }
        })
        expect(peopleWithDishes.length).toBe(2);
   
      } catch (err) {
        fail(err);
      }
    });
  });
  describe('POST to /api/people', () => {
    it('should create a new person and return that persons information if all the required information is given', async () => {
      // HINT: You will be sending data then checking response. No pre-seeding required
      // imagine request is like fetch // await request(app).post...
      // Make sure you test both the API response and whats inside the database anytime you create, update, or delete from the database
      try {
        const newPerson = {name: 'jake', isAttending: false};
        // let's get teh resposne!

        const postResponse = await request(app)
          .post('/api/people')
          .send(newPerson)
          .expect('Content-Type', /json/)
          .expect(200)

        
        const postedPerson = postResponse.body;
        expect(postedPerson.length).toBe(1);
        // expect(postedPerson).toEqual(expect.arrayContaining([expect.objectContaining(newPerson)]))
        expect(postedPerson).toEqual([expect.objectContaining(newPerson)])


      }
      catch (err) {
        fail(err)
      }
    });
    it('should return status code 400 if missing required information', async () => {
      try {
        const failNewPerson = {name: 'tom'};

        const postResponse = await request(app)
          .post('/api/people')
          .send(failNewPerson)
          .expect('Content-Type', /json/)
          .expect(400)
      }
      catch (err) {
        fail(err)
      }
    });
  });

  describe('PUT to /api/people/:id', () => {
    // look up docs for supertest
    it('should update a persons information', async () => {

      try {
        // seed the db
        await Promise.all([
          Person.create(person1),
          Person.create(person2),
          Person.create(person3),
        ]);
        const updatedData = {  isAttending: false };
        const updatedPerson = { name: 'mark', isAttending: false }

        await request(app)
          .put(`/api/people/1`)
          .send(updatedData)
          .expect('Content-Type', /json/)
          .expect(200);
        
        // const putPerson = putResponse.body;
        // expect(putPerson).toEqual([expect.objectContaining(updatedPerson)]);


        const checkEditResponse = await request(app)
          .get(`/api/people/`)
          .expect('Content-Type', /json/)
          .expect(200);


        const editedPeople = checkEditResponse.body;
        expect(editedPeople.length).toBe(3);
        expect(editedPeople).toEqual(
          expect.arrayContaining([
            expect.objectContaining(updatedPerson),
            expect.objectContaining(person2),
            expect.objectContaining(person3)
          ])
        );
      } catch (err) {
        fail(err);
      }
    });
    it('should return a 400 if given an invalid id', async () => {
      const updatedData = {  isAttending: false };
      await request(app)
        .put('/api/people/5')
        .send(updatedData)
        .expect(400)
    });
  });

  xdescribe('DELETE to /api/people/:id', () => {
    it('should remove a person from the database', async () => {
      try {
        // seed the db
        await Promise.all([
          Person.create(person1),
          Person.create(person2),
          Person.create(person3)
        ]);
        // now delete someone!
        // who will it be???
        const deleteId = Math.floor(Math.random() * 3);
        await request(app)
          .delete(`/api/people/${deleteId}`)
          

        // now let's see who survived!
        
        const survived = await request(app)
          .get('/api/people')
          .expect('Content-Type', /json/)
          .expect(200)
        
        const survivedPeople = survived.body;
        expect(survivedPeople.length).toBe(2)
      }
      catch (err) {
        fail(err);
      }
    });
    it('should return a 400 if given an invalid id', async () => {
      const deleteResposne = await request(app)
        .delete(`/api/people/4`)
        .expect(400)
    });
  });
});
