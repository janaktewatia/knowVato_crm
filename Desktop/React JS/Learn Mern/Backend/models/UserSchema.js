const mongoose = require("mongoose");

const user_schema = new mongoose.Schema({

    username : 
    {
        type:String,
        required:true,

    },
    email : 
    {
        type:String,
        required:true,
         unique: true,          // har user ka email unique hoga
      lowercase: true,       // email ko lowercase me convert karega
      trim: true

    },
    phone_no : 
    {
        type: String,
        required:true,

    },
    password : 
    {
        type:String,
        required:true,
        minlength: 6 

    },
    createdAt: {
      type: Date,
      default: Date.now ,     // jab user create hoga, current date/time store karega
     
    }


})


const user = new mongoose.model("UserDetails",user_schema);


module.exports = user;