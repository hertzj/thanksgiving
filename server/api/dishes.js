const router = require("express").Router();
const { Dish, Person } = require("../../db");

// make sure to use router.get, router.post etc..., instead of app.get, app.post, or etc... in this file.
// see https://expressjs.com/en/api.html#router

// router.get("/", (req, res, next) => {});
// there must be a way to do the id and no params within one codeblock
router.get("/", (req, res, next) => {
    Dish.findAll()
        .then(dishes => {
            res.statusCode = 200;
            res.send(dishes)
        })
        .catch(e => {
            res.statusCode = 400;
            next(e)
        })
});

// with where
// router.get("/:id", (req, res, next) => {
//     const where = {}
//     if (req.params.id) {
//         const id = req.params.id;
//         where.id = id
//     }

//     Dish.findAll({
//         where,
//     })
//         .then(dishes => {
//             res.statusCode = 200;
//             res.send(dishes)
//         })
//         .catch(e => {
//             res.statusCode = 400;
//             next(e)
//         })
// });

// with findByPk
router.get("/:id", (req, res, next) => {
    const id = req.params.id
    Dish.findByPk(id)
        .then(dish => {
            res.statusCode = 200;
            res.send(dish)
        })
        .catch(e => {
            res.statusCode = 400;
            next(e)
        })
});

router.post('/', (req, res, next) => {
    Dish.create(req.body)
        .then(() => Dish.findAll()) // think we could just send the new dish
        .then(dishes => {
            res.statusCode = 200;
            res.send(dishes)
        })
        .catch(e => {
            res.statusCode = 400;
            next(e);
        })
})

// I do this with promises in the people route
router.put('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const { name, description } = req.body;
        let dishToChange = await Dish.findByPk(id)
        dishToChange = await dishToChange.update({ name, description })
        res.statusCode = 200;
        res.send(dishToChange);
    }
    catch (e) {
        res.statusCode= 400;
        next(e)
    }
})

router.delete('/:id', (req, res, next) => {
    const id = req.params.id;
    Dish.destroy({
        where: {
            id,
        }
    })
    .then(dishes => {
        res.sendStatus = 200;
        res.sendStatus(dishes)
    })
    .catch(e => {
        res.sendStatus = 400;
        next(e)
    })
})



module.exports = router;
