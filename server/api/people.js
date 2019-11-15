const router = require("express").Router();
const { Person, Dish } = require("../../db");

// make sure to use router.get, router.post etc..., instead of app.get, app.post, or etc... in this file.
// see https://expressjs.com/en/api.html#routers

// router.get("/", (req, res, next) => {});

// /api/people
// for id /:id

// remmeber that for a post (and a put, maybe) the json must be in this format:

// {
//     "name": "Jake", "isAttending": "false"
// }

router.get("/", (req, res, next) => {
    const where = {};
    const include = [];
    if (req.query.is_attending === 'true') {
        where.isAttending = true
    }
    else if (req.query.is_attending === 'false') {
        where.isAttending = false
    }
    if (req.query.include_dishes === 'true') {
        include.push(Dish)


    }
    // console.log(Object.keys(req));
    // console.log('hi from slash', req.query)
    Person.findAll({
        where,
        include,
    })
        .then(people => {
            res.statusCode = 200;
            res.send(people)
        })
        .catch(e => {
            res.statusCode = 400;
            next(e);
        })
});

router.post('/', (req, res, next) => {
    Person.create(req.body)
        .then(() => Person.findAll())
        .then(people => {
            res.statusCode = 200;
            res.send(people)
        })
        .catch(e => {
            res.statusCode = 400;
            next(e);
        })
})

router.put('/:id', (req, res, next) => {
    // console.log(Object.keys(req.params.id));
    // const { id } = req.params
    const id = req.params.id;
    const { name, isAttending} = req.body;
    // Person.findByPk(id)
    //     .then(person => console.log('the person is: ', person))
    //     .catch(e => {
    //       res.statusCode = 400;
    //       next(e);
    // })

    // works except error
    Person.update({
            name,
            isAttending,
        }, {
            where: {
                id,
            }
        })
    .then(people => {
        res.statusCode = 200;
        res.send(people);
    })
    .catch(e => {
        res.statusCode = 400;
        next(e);
    })

    //     Person.findByPk(id)
    //     .then(person => {
    //         Person.update({
    //             name,
    //             isAttending
    //         }, {
    //             where: {
    //                 id: person.id
    //             }
    //         })
    //     })
    //     .catch(e => {
    //     res.statusCode = 400;
    //     next(e);
    // })

})


router.delete('/:id', (req, res, next) => {
    // console.log(Object.entries(req.params));
    // console.log(req.params.id)
    const id = req.params.id
    console.log(id)
    Person.destroy({
        where: {
            id,
        }
    })
    .then(people => {
        res.sendStatus = 200;
        res.sendStatus(people);
    })
    .catch(e => {
        res.sendStatus = 400;
        next(e);
    })

})




module.exports = router;
