const mongoose = require('mongoose');

async function connectDB(urlConnect) {
    await mongoose.connect(urlConnect);
    console.log(`connected to mongodb`);
}

async function closeDB() {
    console.log(`disconnected to mongodb`);
    await mongoose.disconnect();
    
}

module.exports = {
    connectDB,
    closeDB,
};