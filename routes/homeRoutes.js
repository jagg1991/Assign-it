const router = require('express').Router();

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

module.exports = router