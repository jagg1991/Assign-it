const User = require('./User');
const Task = require('./Tasks');

Task.belongsToMany(User, {
    through: {
        model: User,
        unique: false,
    }
});

module.exports = { User, Task }