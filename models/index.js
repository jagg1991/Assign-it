const User = require('./user');
const Task = require('./Tasks');

Task.belongsTo(User, {
    foreignKey: 'user_id',
});

User.hasMany(Task, {
    foreignKey: 'user_id',
})

module.exports = { User, Task }
