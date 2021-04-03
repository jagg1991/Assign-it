const router = require('express').Router();
const { Task, User } = require('../models')

router.get('/home', (req, res) => {
    //calling handlebars file
    res.render('homepage')
});

router.get('/login', (req, res) => {
    //calling handlebars file
    res.render('login')
});

router.get('/signup', (req, res) => {
    //calling handlebars file
    res.render('signup')
});

router.get('/manager', (req, res) => {
    //calling handlebars file
    res.render('manager')
});


router.get('/manager:/id', async (req, res) => {
    try {
        const managerData = await User.findByPk(req.params.id, {
            include: [
                {
                    model: Task,
                }
            ]
        });
        const manager = managerData.get({ plain: true });
        res.render('manager', {
            ...manager,
            logged_in: req.session.logged_in
        })
    } catch (err) {
        res.status(500).json(err);
    }
})

module.exports = router