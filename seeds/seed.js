const sequelize = require('../config/connection');

const User = require('../models/User');
const Task = require('../models/Tasks');


const userSeedData = require('./userSeedData.json');
const taskSeedData = require('./tasksSeedData.json');


// Add the `async` keyword to the function `seedDatabase` to make Asynchronous.
const seedDatabase = async () => {

    // Add the `await` keyword infront of the expressions inside the `async` function.
    await sequelize.sync({ force: true });

    // Once JavaScript recogonizes the `await` keyword it waits for the promise to be fufilled before moving on.
    const user = await User.bulkCreate(userSeedData);
    const task = await Task.bulkCreate(taskSeedData);



    process.exit(0);
};

seedDatabase();