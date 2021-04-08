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

router.get('/manager', (req, res) => {
    //calling handlebars file
    res.render('manager', {
        style: 'manager.css',
        style: 'manager2.css',

    })
});
router.get('/employee', (req, res) => {
    //calling handlebars file
    res.render('employee', {
        style: "employee.css"
    })
});


router.get('/profile', withAuth, async (req, res) => {
    try {
        // Find the logged in user based on the session ID
        const userData = await User.findByPk(req.session.user_id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Task }],
        });

        const user = userData.get({ plain: true });

        res.render('profile', {
            ...user,
            logged_in: true
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router