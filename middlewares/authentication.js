const jwt = require("jsonwebtoken");
require("dotenv").config();

async function authentication(req, res, next) {
  let token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;
  if (!token) {
    res.status(401).send({ msg: "token missing", status: "error" });
    return;
  }
  try {
    let decoded = jwt.verify(token, process.env.SECRET_KEY);

    req.body.userId = decoded.userId;

    next();
  } catch (err) {
    res.status(401).send({ msg: "invalid token", status: "error" });
  }
}

module.exports = authentication;
