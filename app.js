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

const uploadedImagesSchema = new mongoose.Schema({
  enrollmentno: String,
  firstImagePath: String,
  secondImagePath: String,
  thirdImagePath: String
});

const validateAttendanceSchema = new mongoose.Schema({
  enrollmentno: String,
  tries: Number,
  subjectCode: String,
  facultyCode: String,
  todaysDate: String,
  currTime: String
});

const attendanceSchema = new mongoose.Schema({
  studentName: String,
  enrollmentno: String,
  branch: String,
  subjectCode: String,
  facultyCode: String,
  todaysDate: String,
  currTime: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("user", userSchema);
const UploadedImages = mongoose.model("uploadedimages", uploadedImagesSchema);
const Validateattendance = mongoose.model("validateattendance", validateAttendanceSchema);
const Attendance = mongoose.model("attendance", attendanceSchema);

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
  const currUser = req.user._id;
  UploadedImages.findOne({enrollmentno: req.user.enrollmentno}, function(err, result) {
    if(result === null){
      res.redirect("/uploadimages");
    }else{
      res.render("home", {studentName: req.user.studentName, enrollmentno: req.user.enrollmentno, branch: req.user.branch, username: req.user.username, imageUploaded: result.firstImagePath});
    }
  });
});

app.get("/uploadimages", function(req, res) {
  const currUser = req.user._id;
  UploadedImages.findOne({enrollmentno: req.user.enrollmentno}, function(err, result) {
    if(result === null){
      User.findOne({_id: currUser}, function(err, result) {
        if (err) {
          console.log(err);
        } else {
          res.render("uploadimages", {studentName: result.studentName, enrollmentno: result.enrollmentno});
        }
      });
    }else{
      res.redirect("/");
    }
  });
});

app.post("/", function(req, res) {
  console.log(req.body);
  const currUser = req.body.username;
  let errors = [];
  if(req.body.subjectCode === "Select Subject Code"){
    errors.push({msg: "Please Select Subject Code"});
  }
  if(errors.length > 0){
    res.render("home", {errors, studentName: req.body.studentName, enrollmentno: req.body.enrollmentno, branch: req.body.branch, username: currUser, imageUploaded: req.body.imageUploaded});
  }else{
    const d = new Date();
    let todaysDate = "";
    const date = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    todaysDate += date + "/" + month + "/" + year;
    let currTime = "";
    const hour = d.getHours();
    const minute = d.getMinutes();
    const second = d.getSeconds();
    currTime += hour + ":" + minute + ":" + second;
    Attendance.findOne({enrollmentno: req.body.enrollmentno, todaysDate: todaysDate, subjectCode: req.body.subjectCode}, function(err, result) {
      if (err) {
        console.log(err);
      } else {
        if (result === null) {
          Validateattendance.findOne({enrollmentno: req.body.enrollmentno, todaysDate: todaysDate, subjectCode: req.body.subjectCode}, function(err, result) {
            if (err) {
              console.log(err);
            } else {
              if (result === null) {
                const attendancevalidator = new Validateattendance({
                  enrollmentno: req.body.enrollmentno,
                  tries: 1,
                  subjectCode: req.body.subjectCode,
                  facultyCode: req.body.facultyCode,
                  todaysDate: todaysDate,
                  currTime: currTime
                });
                attendancevalidator.save();
                UploadedImages.findOne({enrollmentno: req.body.enrollmentno}, function(err, result) {
                  if(err){
                    console.log(err);
                  }else{
                    res.render("attendance", {studentName: req.body.studentName, enrollmentno: req.body.enrollmentno, branch: req.body.branch, subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, imageUploaded: req.body.imageUploaded, firstImage: result.firstImagePath, secondImage: result.secondImagePath, thirdImage: result.thirdImagePath});
                  }
                });
              } else {
                const tryVar = result.tries + 1;
                if (tryVar === 6) {
                  res.render("attendanceFull", {studentName: req.body.studentName, enrollmentno: req.body.enrollmentno, branch: req.body.branch, subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, imageUploaded: req.body.imageUploaded});
                } else {
                  Validateattendance.findOneAndUpdate({enrollmentno: req.body.enrollmentno, todaysDate: todaysDate, subjectCode: req.body.subjectCode}, {tries: tryVar, currTime: currTime}, function(err, result) {
                    if (err) {
                      console.log(err);
                    }
                  });
                  UploadedImages.findOne({enrollmentno: req.body.enrollmentno}, function(err, result) {
                    if(err){
                      console.log(err);
                    }else{
                      res.render("attendance", {studentName: req.body.studentName, enrollmentno: req.body.enrollmentno, branch: req.body.branch, subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, imageUploaded: req.body.imageUploaded, firstImage: result.firstImagePath, secondImage: result.secondImagePath, thirdImage: result.thirdImagePath});
                    }
                  });
                }
              }
            }
          })
        } else {
          res.render("messages", {msg: "Attendance is already marked for this subject.", studentName: req.body.studentName, imageUploaded: req.body.imageUploaded, buttonText: "Home"});
        }
      }
    });
  }
});

// app.get("/viewattendance", async function(req, res) {
// let docs = await Attendance.aggregate([
//   {
//     $group: {
//       _id: {
//         studentName: "$studentName",
//         enrollmentno: "$enrollmentno",
//         branch: "$branch",
//         subjectCode: "$subjectCode",
//         facultyCode: "$facultyCode",
//         todaysDate: "$todaysDate"
//       },
//       doc: {
//         $last: "$$ROOT"
//       }
//     }
//   },
//   {
//     $replaceRoot: {
//       newRoot: "$doc"
//     }
//   }
// ]);
// console.log(docs.length);
// res.send("Hello!");
// });

app.post("/tryagain", function(req, res) {
  res.redirect("/");
});

app.post("/pushattendance", function(req, res) {
  console.log(req.body);
  const d = new Date();
  let todaysDate = "";
  const date = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  todaysDate += date + "/" + month + "/" + year;
  let currTime = "";
  const hour = d.getHours();
  const minute = d.getMinutes();
  const second = d.getSeconds();
  currTime += hour + ":" + minute + ":" + second;
  Attendance.findOne({enrollmentno: req.body.enrollmentno, subjectCode: req.body.subjectCode, todaysDate: todaysDate}, function(err, result){
    if(err){
      console.log(err);
    }else{
      if(result === null){
        const attendee = new Attendance({
          studentName: req.body.studentName,
          enrollmentno: req.body.enrollmentno,
          branch: req.body.branch,
          subjectCode: req.body.subjectCode,
          facultyCode: req.body.facultyCode,
          todaysDate: todaysDate,
          currTime: currTime
        });
        attendee.save();
        res.render("messages", {msg: "Attendance was recorded successfully in the system.", studentName: req.body.studentName, imageUploaded: req.body.imageUploaded, buttonText: "Home"});
      }else{
        res.render("messages", {msg: "Attendance was recorded successfully in the system.", studentName: req.body.studentName, imageUploaded: req.body.imageUploaded, buttonText: "Home"});
      }
    }
  });
});

app.post("/uploadimages", function(req, res) {
  let errors = [];
  const firstImage = req.files.firstImage;
  const secondImage = req.files.secondImage;
  const thirdImage = req.files.thirdImage;
  if((firstImage.md5 === secondImage.md5) || (firstImage.md5 === thirdImage.md5) || (secondImage.md5 === thirdImage.md5)){
    errors.push({msg: "All photos should be distinct"});
    res.render("uploadimages", {errors, studentName: req.body.studentName, enrollmentno: req.body.enrollmentno});
  }else{
    const imagesuploaded = new UploadedImages({
      enrollmentno: req.body.enrollmentno,
      firstImagePath: "Link1",
      secondImagePath: "Link2",
      thirdImagePath: "Link3"
    });
    imagesuploaded.save();
    const query = {enrollmentno: req.body.enrollmentno};
    cloudinary.uploader.upload(firstImage.tempFilePath, (err, result) => {
      const firstLink = result.url;
      UploadedImages.findOneAndUpdate(query, {firstImagePath: firstLink}, function(err, result){
        if(err){
          console.log(err);
        }
      });
    });
    cloudinary.uploader.upload(secondImage.tempFilePath, (err, result) => {
      const secondLink = result.url;
      UploadedImages.findOneAndUpdate(query, {secondImagePath: secondLink}, function(err, result){
        if(err){
          console.log(err);
        }
      });
    });
    cloudinary.uploader.upload(thirdImage.tempFilePath, (err, result) => {
      const thirdLink = result.url;
      UploadedImages.findOneAndUpdate(query, {thirdImagePath: thirdLink}, function(err, result){
        if(err){
          console.log(err);
        }
      });
    });
    res.render("message", {msg: "Images Uploaded Successfully!", studentName: req.body.studentName});
  }
});

app.post("/attendanceFull", function(req, res) {
  console.log(req.body);
  res.send("Hello!");
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
          errors.push({msg: "Please Select branch"});
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
