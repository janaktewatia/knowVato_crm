const bcrypt = require("bcrypt");


// const express = require("express");
const User = require('../models/UserSchema');

// Register Controller
const register = async (req, res) => {
  try {
    // 1️⃣ Frontend/Postman se data lena
    const { username, email, phone_no ,password } = req.body;
    console.log('req.body:', req.body);


if(!username || !email || !phone_no || !password){
        return res.status(400).send("All fields (username, email, phone_no, password) are required");
    }
const SALT_ROUNDS = parseInt(process.env.HASHPASSWORD, 10) || 10;


    const hashpassword = await bcrypt.hash(password,SALT_ROUNDS);


    // 2️⃣ Naya user create karna
    const newUser = new User({
      username,
      email,
      phone_no,
      password: hashpassword,
    });

    // 3️⃣ DB me save karna
    await newUser.save();
    console.log('User saved in DB:', newUser);


    // 4️⃣ Success response
    res.send(`User created successfully with the name ${newUser.username || username || 'unknown'}`);
  } catch (error) {
    console.log("Error details:", error);

    // Duplicate email check
    if(error.code === 11000){
        try {
            // Ensure User model is correctly imported
            const existingUser = await User.findOne({ email: req.body.email.toLowerCase() });
            if(existingUser){
                return res.status(400).send(
                    `Email already exists with the username: ${existingUser.username}`
                );
            } else {
                return res.status(400).send("Email already exists");
            }
        } catch(findError){
            console.log("FindOne Error:", findError);
            return res.status(500).send("Error checking existing user");
        }
    }

    // Any other error
    return res.status(400).send(error.message);

}
  
};

module.exports = register;
