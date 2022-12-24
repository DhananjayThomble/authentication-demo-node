require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const encrypt = require("mongoose-encryption");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

const PORT = process.env.PORT;
const DB_URL = process.env.DB_URL;

// ------------------------------------db-------------------------------
mongoose.set("strictQuery", "false");
main().catch((err) => console.log(err));
async function main() {
  mongoose.connect(DB_URL);
}

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const secret = process.env.SECRET;
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });

const User = new mongoose.model("user", userSchema);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password,
  });
  newUser.save((err) => {
    if (err) console.error(err);
    else {
      console.log("user created!");
      res.render("secrets");
    }
  });
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ email: username }, (err, result) => {
    if (err) console.error(err);
    else {
      if (result.password === password) {
        res.render("secrets");
      } else {
        res.send("Invalid credentials!");
      }
    }
  });
});

app.listen(PORT, () => {
  console.log("Server started at " + PORT);
});
