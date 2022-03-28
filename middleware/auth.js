require("../config/database").connect();
const jwt = require("jsonwebtoken");
const User = require("../model/user");

const verifyUser = async (req, res, next) => {
    const token =
        req.body.token || req.query.token || req.headers["x-access-token"];
    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }

    const decoded = jwt.verify(token, "my_secret_key");
    const mobile = decoded.mobile;
    const user = await User.findOne({ mobile });
    res.json(user)

    return next();
};


const verifyAdmin = async (req, res, next) => {
    const token =
        req.body.token || req.query.token || req.headers["x-access-token"];
    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    const decoded = jwt.verify(token, "my_secret_key");
    if (decoded.role === "admin") {
        const users = await User.find({mobile:{$exists:true}});
        res.json(users)
      }
      else {
        res.status(401).json({
          statusCode: 401,
          message: "You are not authorized to access this API",
        });
      }
    return next();
};

module.exports = {verifyUser, verifyAdmin};