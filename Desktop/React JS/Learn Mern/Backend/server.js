require("dotenv").config();


const connection11 = require("./utils/DbConnection");
const router = require("./Route/router");

const express = require("express");

const app = express();

app.use(express.json());

const cors = require('cors');
app.use(cors({
  origin: "http://localhost:3000",  // frontend ka URL
  methods: ["GET","POST","PUT","DELETE"],
}));


app.use("/knowvato",router);




connection11();
const PORT = 5000;
app.listen(PORT,() => {
  console.log("Server is running....")
});

