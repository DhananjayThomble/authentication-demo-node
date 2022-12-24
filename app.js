require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");
// const encrypt = require("mongoose-encryption");
// const md5 = require("md5");
const bcrypt = require("bcrypt");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

const PORT = process.env.PORT;
const DB_URL = process.env.DB_URL;
const saltRounds = 11; // for bcrpyt

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

// const secret = process.env.SECRET;
// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });

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
  // const hashedPassword = bcrypt.hashSync(req.body.password, saltRounds);   //sync method

  // async method
  bcrypt.hash(req.body.password, saltRounds, function (error, hash) {
    // Store hash in your password DB.
    if (error) console.error(error);

    const newUser = new User({
      email: req.body.username,
      password: hash, // hashing the password with bcrypt
    });

    newUser.save((err) => {
      if (err) console.error(err);
      else {
        console.log("user created!");
        res.render("secrets");
      }
    });
  });
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ email: username }, (err, result) => {
    if (err) console.error(err);
    else {
      // email is found on DB
      bcrypt.compare(
        req.body.password,
        result.password,
        function (errHash, result) {
          // result == true
          if (errHash) {
            console.error(errHash);
            return;
          }
          if (result) {
            // password also matched.
            res.render("secrets");
          } else {
            res.send("Invalid Credentials!");
          }
        }
      );
    }
  });
});

app.listen(PORT, () => {
  console.log("Server started at " + PORT);
});
