const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT;

const connection = require("./config/db");
const userRouter = require("./routers/userRouter");
const eventRouter = require("./routers/eventRouter");

const authentication = require("./middlewares/authentication");

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>This is the Backend for the assignment (Take Live Calls)</h1>");
});

app.use("/user", userRouter);
app.use("/events", authentication, eventRouter);

app.listen(PORT, async () => {
  try {
    await connection;
    console.log("connected to the DB");
  } catch (err) {
    console.log(err);
    console.log("Error while connecting to the DB");
  }
  console.log(`Listening at PORT ${PORT} \nhttp://localhost:${PORT}`);
});
