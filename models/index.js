const User = require('./User');
<<<<<<< HEAD

module.exports = { User };
=======
const Task = require('./Tasks');

Task.belongsTo(User, {
    foreignKey: 'user_id',
});

User.hasMany(Task, {
    foreignKey: 'user_id',
})

module.exports = { User, Task }
>>>>>>> 7733b90ce4359510f2cd9a77c765823c015e3473
