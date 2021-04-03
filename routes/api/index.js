const router = require('express').Router();
const user = require('./user-routes');
const task = require('./taskRoutes')



router.use('/user', user);
router.use('/task', task);


module.exports = router;
