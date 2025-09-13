

const dbconnect = require('mongoose');

const connection = () => {

    dbconnect.connect("mongodb+srv://janak_tewatia:Janak123%23@clusterone.6y4xwlg.mongodb.net/?retryWrites=true&w=majority&appName=ClusterOne");
        console.log("Mongoose connected");
    };



module.exports = connection;