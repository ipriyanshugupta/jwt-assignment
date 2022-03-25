require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("./model/user");
const app = express();
app.use(express.json());

// API for registering user
app.post("/register", async (req, res) => {
  try {
    // Get user input
    const { name, mobile, role } = req.body;
    // Validate user input
    if (!mobile) {
      res.status(400).send("Mobile number is required");
    }

    //checking the length of mobile
    if(mobile.toString().length !== 10){
      res.status(400).send("Mobile number should be of ten digits");
    }
    
    //finding user with same Number
    const oldUser = await User.findOne({ mobile });
    if (oldUser) {
      return res.status(409).send("Mobile number Already Exist");
    }

    // Create token
    const token = jwt.sign(
      { mobile, role },
      "my_secret_key",
      {
        expiresIn: "2h",
      }
    );

    // Create user in our database
    const user = await User.create({
      name,
      mobile,
      role,
      token
    });

    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});


// API for Admin
app.get("/admin", async (req, res) => {
  const token = req.body.token;
  const decoded = jwt.verify(token, "my_secret_key")
  if (decoded.role === "admin") {
    const users = await User.find({});
    res.json(users)
  }
  else {
    res.status(401).json({
      statusCode: 401,
      message: "You are not authorized to access this API",
    });
  }
})

// API for User
app.get("/user", async (req, res) => {
  const {token} = req.body;
  const decoded = jwt.verify(token, "my_secret_key")
  const mobile = decoded.mobile;
  console.log(mobile)
  const user = await User.findOne({ mobile });
  res.json(user)
})

module.exports = app;
