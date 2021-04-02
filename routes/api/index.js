const router = require('express').Router();
const user = require('./user-routes');
const home = require('./home')


router.use('/user', user);
router.use('/home', home)

module.exports = router;
