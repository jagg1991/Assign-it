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
// The `/api/user/:id` endpoint
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

        // req.session.save(() => {
        //     req.session.user_id = userData.id;
        //     req.session.logged_in = true;


        // }); res.status(200).json(userData);

        res.status(200).json(userData);
    } catch (err) {
        res.status(400).json(err);
    }
});

// router.post('/login', async (req, res) => {
//     try {
//         const userData = await User.findOne({ where: { email: req.body.email } });

//         if (!userData) {
//             res
//                 .status(400)
//                 .json({ message: 'Incorrect email or password, please try again' });
//             return;
//         }

//         const validPassword = await userData.checkPassword(req.body.password);

//         if (!validPassword) {
//             res
//                 .status(400)
//                 .json({ message: 'Incorrect email or password, please try again' });
//             return;
//         }

//         req.session.save(() => {
//             req.session.user_id = userData.id;
//             req.session.logged_in = true;

//             res.json({ user: userData, message: 'You are now logged in!' });
//         });

//     } catch (err) {
//         res.status(400).json(err);
//     }
// });

router.delete('/:id', async (req, res) => {
    try {
        const userData = await User.destroy({
            where: {
                id: req.params.id,
            }
        })
        if (!userData) {
            res.status(404).json({ message: 'No user found with this ID!' })
        }

        res.status(200).json(userData);
    } catch (err) {
        res.status(500).json(err);
    }
})


module.exports = router;
