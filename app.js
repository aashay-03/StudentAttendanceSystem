require("dotenv").config()
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const flash = require("connect-flash");
const path = require("path");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true
});

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(fileUpload({
  useTempFiles: true
}));

app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

const mongo_database = process.env.MONGO_REMOTE;

mongoose.connect(`${mongo_database}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));


const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  studentName: String,
  enrollmentno: String,
  branch: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("user", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.get("/login", ensureGuest, function(req, res) {
  res.render("login");
});

app.get("/register", ensureGuest, function(req, res) {
  res.render("register");
});

app.get("/", ensureAuth, function(req, res) {
  res.render("home");
});

app.get("/uploadimages", function(req, res) {
  res.render("uploadimages");
});

app.post("/register", function(req, res) {
  console.log(req.body);
  const email = req.body.username;
  const studentName = req.body.studentName;
  const enrollmentno = req.body.enrollmentno;
  const branch = req.body.branch;
  let errors = [];
  if (req.body.password.length < 6) {
    errors.push({msg: "Password should be atleast 6 characters"});
  }
  if (req.body.password.length > 15) {
    errors.push({msg: "Password should not exceed 15 characters"});
  }
  if (errors.length > 0) {
    res.render("register", {errors, studentName, email, enrollmentno, branch});
  } else {
    if (req.body.enrollmentno.length != 11) {
      errors.push({msg: "Enrollment Number should have 11 digits"});
    }
    if (errors.length > 0) {
      res.render("register", {errors, studentName, email, enrollmentno, branch});
    } else {
      if (req.body.enrollmentno.match(/^[0-9]+$/) == null) {
        errors.push({msg: "Enrollment Number should consist of digits"});
      }
      if (errors.length > 0) {
        res.render("register", {errors, studentName, email, enrollmentno, branch});
      } else {
        if (req.body.branch === "") {
          errors.push({msg: "Please select branch"});
        }
        if (errors.length > 0) {
          res.render("register", {errors, studentName, email, enrollmentno, branch});
        } else {
          User.findOne({enrollmentno: req.body.enrollmentno}, function(err, result) {
            if(err){
              console.log(err);
            }else{
              if (result != null) {
                errors.push({msg: "Invalid Enrollment Number"});
              }
              if (errors.length > 0) {
                res.render("register", {errors, studentName, email, enrollmentno, branch});
              }else{
                User.register({username: req.body.username, studentName: req.body.studentName, enrollmentno: req.body.enrollmentno, branch: req.body.branch}, req.body.password, function(err, user) {
                  if (err) {
                    errors.push({msg: "Email is already registered"})
                    res.render("register", {errors, studentName,email, enrollmentno, branch});
                  } else {
                    passport.authenticate("local")(req, res, function() {
                      res.redirect("/uploadimages");
                    });
                  }
                });
              }
            }
          });
        }
      }
    }
  }
});

app.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true
}));

app.get("/logout", ensureAuth, function(req, res) {
  req.logout();
  req.flash('success_msg', 'You are logged out')
  res.redirect("/login");
});

function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error_msg", "Please login to view this page");
    res.redirect("/login");
  }
}

function ensureGuest(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    return next();
  }
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
  console.log(`The server is running on port ${PORT}.`);
});
