
const URI = process.env.MONGO_URI;

const dbconnect = require('mongoose');

const connection = () => {

    dbconnect.connect(URI);
        console.log("Mongoose connected through .ENV");
    };



module.exports = connection;