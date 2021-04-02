const router = require('express').Router();
const { User, Task } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {

    try {
        const userData = await User.findAll({
            include: [
                {
                    model: Task,
                }
            ]
        });
        res.status(200).json(userData)
    } catch (err) {
        res.status(500).json(err);
    }
});

// router.get('/:id', async (req, res) => {
//     try {

//     } catch (error) {

//     }
// })


module.exports = router;
