const router = require("express").Router();
const { Person, Dish } = require("../../db");

// make sure to use router.get, router.post etc..., instead of app.get, app.post, or etc... in this file.
// see https://expressjs.com/en/api.html#routers


// remmeber that for a post (and a put, maybe) the json must be in this format:
// {
//     "name": "Jake", "isAttending": "false"
// }

router.get("/", (req, res, next) => {
    // console.log(Object.keys(req));
    // console.log('hi from slash', req.query)
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
        .then(() => Person.findAll()) // think we could just send the new person
        .then(people => {
            res.statusCode = 200;
            res.send(people)
        })
        .catch(e => {
            res.statusCode = 400;
            next(e);
        })
})

// put with findByPk
router.put('/:id', (req, res, next) => {
    const id = req.params.id;
    const { name, isAttending } = req.body;
    Person.findByPk(id)
        .then(person => {
            person.update({ name, isAttending })
            res.statusCode = 200;
            res.send(person)
        })
        .catch(e => {
            res.statusCode = 400;
            next(e)
        })
})

// put with findByPk and async try/catch
// router.put('/:id', async (req, res, next) => {
//     try {
//         const id = req.params.id;
//         const { name, isAttending } = req.body;
//         let personToChange = await Person.findByPk(id)
//         personToChange = await personToChange.update({ name, isAttending })
//         res.statusCode = 200;
//         res.send(personToChange);
//     }
//     catch (e) {
//         res.statusCode = 400;
//         next(e)
//     }
// })


// put with Person.update
// router.put('/:id', (req, res, next) => {
//     const id = req.params.id;
//     const { name, isAttending} = req.body;

//     Person.update({
//             name,
//             isAttending,
//         }, {
//             where: {
//                 id,
//             }
//         })
//     .then(numberOfAffectedRows => {
//         if (numberOfAffectedRows[0] === 0) {
//             res.statusCode(400);
//         }
//         res.statusCode = 200;
//         res.send(numberOfAffectedRows)
//     })
//     .catch(e => {
//         res.statusCode = 400;
//         next(e);
//     })

// })


router.delete('/:id', (req, res, next) => {
    // console.log(Object.entries(req.params));
    // console.log(req.params.id)
    const id = req.params.id
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
