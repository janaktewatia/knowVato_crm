

const bcrypt = require("bcrypt")

const user = require("../models/UserSchema")


const Login = async (req,res) => {

    try{
        const {email, password} = req.body;
        console.log(req.body)


        if(!email || !password){
             return res.status(400).send("Kindly enter email and Password");
        }




        const existingUser = await user.findOne({ email: email.toLowerCase() });
        console.log({existingUser});

if(!existingUser){
    return res.status(400).send("Email does not exist");
}

const passwordCheck = await bcrypt.compare(password,existingUser.password)
if(!passwordCheck){
    return res.status(400).send("Kindly enter correct password");

}
else{
        res.status(200).send("User Logged in Successfully");

}

    }catch(error){
console.error("Login Error:", error);
    return res.status(500).send("Internal server error");
    }



}


module.exports = Login;