const router = require('express').Router();
const { User, Task } = require('../../models');

router.get('/', async (req, res) => {

    try {
        const taskData = await Task.findAll({

        });
        res.status(200).json(taskData)
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const taskData = await Task.findByPk(req.params.id, {

        });
        if (!taskData) {
            res.status(404).json({ message: 'No task found with that ID!' })
        }
        res.status(200).json(taskData);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.post('/', async (req, res) => {
    try {
        const taskData = await Task.create(req.body);

        res.status(200).json(taskData);
    } catch (err) {
        res.status(400).json(err);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const taskData = await Task.destroy({
            where: {
                id: req.params.id,
            }
        })
        if (!taskData) {
            res.status(404).json({ message: 'No task found with this ID!' })
        }

        res.status(200).json(taskData);
    } catch (err) {
        res.status(500).json(err);
    }
})

module.exports = router;