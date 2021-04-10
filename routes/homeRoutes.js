const router = require('express').Router();
const { Task, User } = require('../models');
const withAuth = require('../utils/auth');

router.get('/', (req, res) => {
    //calling handlebars file
    res.render('homepage', {
        style: 'home.css',
        logged_in: req.session.logged_in,

    })
});

router.get('/login', (req, res) => {
    //calling handlebars file
    if (req.session.logged_in) {
        res.redirect('manager')
    }
    res.render('login', {
        style: 'login.css'
    })
});

router.get('/signup', (req, res) => {
    //calling handlebars file
    res.render('signup', {
        style: 'signup.css'
    })
});

// router.get('/manager', (req, res) => {
//     //calling handlebars file
//     res.render('manager', {
//         style: 'manager.css',
//         style: 'manager2.css',

//     })
// });
router.get('/employee', withAuth, async (req, res) => {
    //calling handlebars file

    const userData = await User.findByPk(req.session.user_id, {
        attributes: { exclude: ['password'] },
        include: [{ model: Task }],
    });

    const user = userData.get({ plain: true });

    const taskData = await Task.findAll({
        where: {
            user_id: req.session.user_id
        }
    });

    const tasks = taskData.map((task) => task.get({ plain: true }))

    res.render('employee', {
        style: "employee.css",
        tasks,
        ...user,
        logged_in: true,
    })
});


router.get('/manager', withAuth, async (req, res) => {
    try {
        // Find the logged in user based on the session ID
        const userData = await User.findByPk(req.session.user_id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Task }],
        });

        const user = userData.get({ plain: true });

        const allUsers = await User.findAll({
            where: {
                role: 'employee'
            }

        })

        const allTask = await Task.findAll()

        const tasks = allTask.map((task) => task.get({ plain: true }))
        // console.log(tasks)

        const employees = allUsers.map((user) => user.get({ plain: true }));
        console.log(employees)


        res.render('manager', {

            ...user,
            logged_in: true,

            style: 'manager2.css',
            employees,
            tasks
        });
    } catch (err) {
        res.status(500).json(err);
    }
});
router.get('/employee', withAuth, async (req, res) => {
    try {
        // Find the logged in user based on the session ID
        const userData = await User.findByPk(req.session.user_id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Task }],
        });

        const user = userData.get({ plain: true });

        res.render('employee', {
            ...user,
            logged_in: true,
            style: "employee.css"
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

// router.get('/signup', (req, res) => {
//     if (req.session.loggedIn) {
//         res.redirect('/');
//         return;
//     }
//     res.render('signup');
// });


module.exports = router