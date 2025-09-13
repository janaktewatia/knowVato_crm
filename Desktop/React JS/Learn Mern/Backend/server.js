

const express = require("express");

const app = express();

const connection = require("./utils/DbConnection");
const router = require("./Route/router");


app.use("/knowvato",router);




connection();
const PORT = 5000;
app.listen(PORT,() => {
  console.log("Server is running....")
});

