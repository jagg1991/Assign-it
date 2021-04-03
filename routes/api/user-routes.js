const router = require('express').Router();
const { User, Task } = require('../../models');

// The `/api/user` endpoint

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

router.get('/:id', async (req, res) => {
    try {
        const userData = await User.findByPk(req.params.id, {
            include: [
                {
                    model: Task,
                }
            ]
        });
        if (!userData) {
            res.status(404).json({ message: 'No user found with that ID!' })
        }
        res.status(200).json(userData);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post('/', async (req, res) => {
    try {
        const userData = await User.create(req.body);
        res.status(200).json(userData);
    } catch (err) {
        res.status(400).json(err);
    }
})


module.exports = router;
