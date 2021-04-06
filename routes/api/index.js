const router = require('express').Router();
const user = require('./user-routes');
const task = require('./taskRoutes')
const home = require('./home')


router.use('/user', user);
// router.use('/tasks', task)
router.use('/home', home)

module.exports = router;
