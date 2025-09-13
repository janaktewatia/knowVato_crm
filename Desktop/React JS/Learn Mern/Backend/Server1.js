const express = require("express");

const app = express();

const router=require("./Route/Auth-Router");

app.use("/api/auth",router);

// app.get("/",(req,res)=>{
// res.send("This is Admission CRM");

// })

const PORT=5000;
app.listen(PORT,()=>{
    console.log(`Server is runing on Port ${PORT}`)
})
