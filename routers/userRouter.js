const { Router } = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const UserModel = require("../models/UserModel");

const userRouter = Router();

userRouter.post("/register", async (req, res) => {
  let payload = req.body;
  if (
    payload.email == undefined ||
    payload.password == undefined ||
    payload.name == undefined
  ) {
    res.status(400).send({ msg: "some fields are missing", status: "fail" });
    return;
  }

  let userExist = await UserModel.findOne({ email: payload.email });

  if (userExist != null) {
    res.status(400).send({ msg: "user already exists", status: "fail" });
    return;
  } else {
    try {
      let user = new UserModel(payload);
      bcrypt.hash(payload.password, 5, async (err, hash) => {
        if (err) {
          res
            .status(500)
            .send({ msg: "some while registering", status: "error" });
        } else {
          user.password = hash;
          await user.save();
          res
            .status(201)
            .send({ msg: "registered successfully", status: "success" });
        }
      });
    } catch (err) {
      res.status(500).send({ msg: "some while registering", status: "error" });
    }
  }
});

userRouter.post("/login", async (req, res) => {
  let payload = req.body;

  let user = await UserModel.findOne({ email: payload.email });
  if (user == null) {
    res.status(401).send({ msg: "Wrong Credentials", status: "fail" });
  } else {
    try {
      bcrypt.compare(payload.password, user.password, async (err, result) => {
        if (err) {
          res.status(500).send({
            msg: "Some error occurred while logging in, try again later",
            status: "error",
          });
        } else {
          if (result) {
            let userId = user._id;
            let token = jwt.sign({ userId }, process.env.SECRET_KEY);

            res
              .status(200)
              .send({ msg: "log in success", status: "success", token });
          } else {
            res.status(401).send({ msg: "Wrong Credentials", status: "fail" });
          }
        }
      });
    } catch (err) {
      res.status(500).send({
        msg: "Some error occurred while logging in, try again later",
        status: "error",
      });
    }
  }
});

module.exports = userRouter;
