require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("./model/user");
const auth = require("./middleware/auth");
const app = express();
app.use(express.json());

// API for registering user
app.post("/register", async (req, res) => {
  try {
    // Get user input
    const { name, mobile, role, location } = req.body;
    const loc = JSON.parse(location)
    const latitude = loc.latitude;
    const longitude = loc.longitude;
    // Validate user input
    if (!mobile) {
      res.status(400).send("Mobile number is required");
    }

    // Create user in our database
    const user = await User.create({
      name,
      mobile,
      role,
      location: {
        latitude,
        longitude
      }
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, mobile , role },
      "my_secret_key",
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});


// API for Admin
app.get("/admin", (req, res) => {
  const token = req.body.token;
  const decoded = jwt.verify(token, "my_secret_key")
  if(decoded.role === "admin"){
  const users = User.find({});
  res.json(users)
  }
  else{
    res.status(401).json({
        statusCode: 401,
        message: "You are not authorized to access this API",
    });
  }
})

// API for User
app.get("/user", (req, res) => {
  const token = req.body.token;
  const decoded = jwt.verify(token, "my_secret_key")
  const mobile = decoded.mobile;
  const user = User.findOne({ mobile });
  res.send(user)
})

module.exports = app;
