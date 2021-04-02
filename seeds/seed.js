const sequelize = require('../config/connection');

const User = require('../models/User');


const userSeedData = require('./userSeedData.json');


// Add the `async` keyword to the function `seedDatabase` to make Asynchronous.
const seedDatabase = async () => {

    // Add the `await` keyword infront of the expressions inside the `async` function.
    await sequelize.sync({ force: true });

    // Once JavaScript recogonizes the `await` keyword it waits for the promise to be fufilled before moving on.
    await User.bulkCreate(userSeedData);



    process.exit(0);
};

seedDatabase();