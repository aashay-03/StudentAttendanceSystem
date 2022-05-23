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
const LocalStrategy = require("passport-local").Strategy;

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
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

const college_code = process.env.COLLEGE_CODE;
const mongo_database = process.env.MONGO_REMOTE;

mongoose.connect(`${mongo_database}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const studentSchema = new mongoose.Schema({
  email: String,
  password: String,
  studentName: String,
  enrollmentno: String,
  branch: String,
  role: String,
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
  currTime: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const teacherMessageSchema = new mongoose.Schema({
  studentName: String,
  username: String,
  enrollmentno: String,
  branch: String,
  imageUploaded: String,
  subjectCode: String,
  facultyCode: String,
  message: String,
  status: String,
  currMonth: String,
  todaysDate: String,
  currTime: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const teacherSchema = new mongoose.Schema({
  email: String,
  password: String,
  teacherName: String,
  facultyCode: String,
  subjectCode: String,
  role: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

studentSchema.plugin(passportLocalMongoose);
teacherSchema.plugin(passportLocalMongoose);

const Student = mongoose.model("student", studentSchema);
const UploadedImages = mongoose.model("uploadedimages", uploadedImagesSchema);
const Validateattendance = mongoose.model("validateattendance", validateAttendanceSchema);
const Attendance = mongoose.model("attendance", attendanceSchema);
const Teachermessage = mongoose.model("teachermessage", teacherMessageSchema);
const Teacher = mongoose.model("teacher", teacherSchema);

passport.use("student-local", new LocalStrategy(Student.authenticate()));
passport.use("teacher-local", new LocalStrategy(Teacher.authenticate()));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  if(user!=null)
    done(null,user);
});

app.get("/studentLogin", ensureGuestStudent, function(req, res) {
  res.render("studentLogin");
});

app.get("/studentRegister", ensureGuestStudent, function(req, res) {
  res.render("studentRegister");
});

app.get("/teacherLogin", ensureGuestTeacher, function(req, res) {
  res.render("teacherLogin");
});

app.get("/teacherRegister", ensureGuestTeacher, function(req, res) {
  res.render("teacherRegister");
});

app.get("/", function(req, res) {
  try {
    const currUser = req.user;
    console.log(currUser);
    try {
      const my_user = currUser.role;
      console.log(my_user);
      if(my_user === "Teacher"){
        res.redirect("/teacherHome");
      }else{
        res.redirect("/studentHome");
      }
    } catch (e) {
      res.render("firstPage");
    }
  } catch (e) {
    res.render("firstPage");
  }
});

app.post("/", function(req, res) {
  console.log(req.body.button);
  if(req.body.button === "teacher"){
    res.redirect("teacherLogin");
  }else{
    res.redirect("studentLogin");
  }
});

// // ######## change the way not get request ##############
//
// app.get("/viewyourmessages", function(req, res) {
//   UploadedImages.findOne({enrollmentno: req.user.enrollmentno}, function(err, result) {
//     if(err){
//       console.log(err);
//     }else{
//       res.render("viewYourMessages", {studentName: req.user.studentName, imageUploaded: result.firstImagePath});
//     }
//   });
// });

app.get("/studentHome", ensureAuthStudent, function(req, res) {
  const currUser = req.user._id;
  UploadedImages.findOne({enrollmentno: req.user.enrollmentno}, function(err, result) {
    if(result === null){
      res.redirect("/uploadimages");
    }else{
      console.log(result);
      res.render("studentHome", {studentName: req.user.studentName, username: req.user.username, enrollmentno: req.user.enrollmentno, branch: req.user.branch, username: req.user.username, imageUploaded: result.firstImagePath});
    }
  });
});

app.get("/teacherHome", ensureAuthTeacher, function(req, res) {
  res.render("teacherHome", {teacherName: req.user.teacherName, subjectCode: req.user.subjectCode, facultyCode: req.user.facultyCode});
});

app.get("/uploadimages", ensureAuthStudent, function(req, res) {
  const currUser = req.user._id;
  UploadedImages.findOne({enrollmentno: req.user.enrollmentno}, function(err, result) {
    if(result === null){
      Student.findOne({_id: currUser}, function(err, result) {
        if (err) {
          console.log(err);
        } else {
          res.render("uploadImages", {studentName: result.studentName, enrollmentno: result.enrollmentno});
        }
      });
    }else{
      res.redirect("/studentHome");
    }
  });
});

app.post("/studentHome", function(req, res) {
  console.log(req.body);
  const currUser = req.body.username;
  let errors = [];
  if(req.body.subjectCode === "Select Subject Code"){
    errors.push({msg: "Please Select Subject Code"});
  }
  if(errors.length > 0){
    res.render("studentHome", {errors, studentName: req.body.studentName, enrollmentno: req.body.enrollmentno, branch: req.body.branch, username: currUser, imageUploaded: req.body.imageUploaded});
  }else{
    const d = new Date();
    let todaysDate = "";
    let date = d.getDate();
    if(date >= 1 && date <= 9){
      date = "0" + date;
    }
    let month = d.getMonth() + 1;
    if(month >= 1 && month <= 9){
      month = "0" + month;
    }
    let year = d.getFullYear();
    todaysDate += date + "/" + month + "/" + year;
    let currTime = "";
    let hour = d.getHours();
    if(hour >= 0 && hour <= 9){
      hour = "0" + hour;
    }
    let minute = d.getMinutes();
    if(minute >= 0 && minute <= 9){
      minute = "0" + minute;
    }
    let second = d.getSeconds();
    if(second >= 0 && second <= 9){
      second = "0" + second;
    }
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
                    res.render("attendance", {studentName: req.body.studentName, enrollmentno: req.body.enrollmentno, branch: req.body.branch, subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, imageUploaded: req.body.imageUploaded, firstImage: result.firstImagePath});
                  }
                });
              } else {
                const tryVar = result.tries + 1;
                if (tryVar === 6) {
                  res.render("attendanceFull", {studentName: req.body.studentName, username: req.body.username, enrollmentno: req.body.enrollmentno, branch: req.body.branch, subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, imageUploaded: req.body.imageUploaded});
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
                      res.render("attendance", {studentName: req.body.studentName, enrollmentno: req.body.enrollmentno, branch: req.body.branch, subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, imageUploaded: req.body.imageUploaded, firstImage: result.firstImagePath});
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

app.post("/viewattendance", ensureAuthTeacher, function(req, res) {
  const d = new Date();
  let todaysDate = "";
  let date = d.getDate();
  if(date >= 1 && date <= 9){
    date = "0" + date;
  }
  let month = d.getMonth() + 1;
  if(month >= 1 && month <= 9){
    month = "0" + month;
  }
  let year = d.getFullYear();
  todaysDate += year + "-" + month + "-" + date;
  res.render("viewAttendance", {teacherName: req.body.teacherName, subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, branchValue: "Select Branch", branch: "Select Branch", todaysDate: todaysDate, attendanceOnTime: [], attendanceNotOnTime: [], key: 0, dateSelected: "", len: 1, startTime: "", endTime: ""});
});

app.post("/viewspecificattendance", async function(req, res) {
  console.log(req.body);
  const startTime = req.body.startingRange;
  const endTime = req.body.endingRange;
  const startingArr = startTime.split(":");
  const endingArr = endTime.split(":");
  const checkStartingTime = (parseInt(startingArr[0]) * 3600) + (parseInt(startingArr[1]) * 60);
  const checkEndingTime = (parseInt(endingArr[0]) * 3600) + (parseInt(endingArr[1]) * 60);
  let docs = await Attendance.aggregate([
    {
      $group: {
        _id: {
          studentName: "$studentName",
          enrollmentno: "$enrollmentno",
          branch: "$branch",
          subjectCode: "$subjectCode",
          facultyCode: "$facultyCode",
          todaysDate: "$todaysDate"
        },
        doc: {
          $last: "$$ROOT"
        }
      }
    },
    {
      $replaceRoot: {
        newRoot: "$doc"
      }
    }
  ]);
  const d = new Date();
  let todaysDate = "";
  let date = d.getDate();
  if(date >= 1 && date <= 9){
    date = "0" + date;
  }
  let month = d.getMonth() + 1;
  if(month >= 1 && month <= 9){
    month = "0" + month;
  }
  let year = d.getFullYear();
  todaysDate += year + "-" + month + "-" + date;
  let errors = [];
  if(req.body.branch === "Select Branch"){
    errors.push({msg: "Please Select Branch"});
  }
  if(errors.length > 0){
    res.render("viewAttendance", {errors, teacherName: req.body.teacherName, subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, branchValue: "Select Branch", branch: "Select Branch", todaysDate: todaysDate, attendanceOnTime: [], attendanceNotOnTime: [], key: 0, dateSelected: req.body.attendanceDate, len: 1, startTime: startTime, endTime: endTime});
  }else{
    if(checkEndingTime < checkStartingTime){
      errors.push({msg: "Invalid Time Range"});
    }
    if(errors.length > 0){
      res.render("viewAttendance", {errors, teacherName: req.body.teacherName, subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, branchValue: req.body.branch, branch: req.body.branch, todaysDate: todaysDate, attendanceOnTime: [], attendanceNotOnTime: [], key: 0, dateSelected: req.body.attendanceDate, len: 1, startTime: "", endTime: ""})
    }else{
      const myArr = req.body.attendanceDate.split("-");
      let attDate = "";
      let attDay = parseInt(myArr[2]);
      if(attDate >= 1 && attDate <= 9){
        attDate = "0" + attDate;
      }
      let attMonth = parseInt(myArr[1]);
      if(attMonth >= 1 && attMonth <= 9){
        attMonth = "0" + attMonth;
      }
      let attYear = parseInt(myArr[0]);
      attDate += attDay + "/" + attMonth + "/" + attYear;
      console.log(attDate);
      // console.log(docs);
      let startingTime = req.body.startingRange;
      startingTime += ":00";
      let endingTime = req.body.endingRange;
      endingTime += ":00";
      let firstDate = "" + req.body.attendanceDate + " ";
      firstDate += startingTime;
      let secondDate = "" + req.body.attendanceDate + " ";
      secondDate += endingTime;
      const firstDateFinal = new Date(firstDate);
      const secondDateFinal = new Date(secondDate);
      console.log(firstDateFinal);
      console.log(secondDateFinal);
      const finalAttendance = docs.filter(function(el) {
        return el.subjectCode === req.body.subjectCode &&
               el.facultyCode === req.body.facultyCode &&
               el.branch === req.body.branch &&
               el.todaysDate === attDate;
      });
      finalAttendance.sort(function(a, b) {
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
      console.log(finalAttendance);
      const onTimeAttendance = finalAttendance.filter(function(el) {
        return el.createdAt >= firstDateFinal &&
               el.createdAt <= secondDateFinal;
      });
      const notOnTimeAttendance = finalAttendance.filter(function(el) {
        return el.createdAt < firstDateFinal ||
               el.createdAt > secondDateFinal;
      });
      res.render("viewAttendance", {teacherName: req.body.teacherName, subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, branchValue: req.body.branch, branch: req.body.branch, todaysDate: todaysDate, attendanceOnTime: onTimeAttendance, attendanceNotOnTime: notOnTimeAttendance, key: 1, dateSelected: req.body.attendanceDate, len: finalAttendance.length, startTime: startTime, endTime: endTime});
    }
  }
});

app.post("/viewmessages", ensureAuthTeacher, function(req, res) {
  console.log(req.body);
  let date = new Date();
  date.setDate(date.getDate() - 15);
  Teachermessage.find({subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, status: "Unread", "createdAt": {"$gte": date}}, function(err, unreadMessages){
    if(err){
      console.log(err);
    }else{
      Teachermessage.find({subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, status: "Read", "createdAt": {"$gte": date}}, function(err, readMessages){
        if(err){
          console.log(err);
        }else{
          console.log(readMessages);
          console.log(unreadMessages);
          console.log(req.body.teacherName);
          res.render("viewmessages", {teacherName: req.body.teacherName, subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, unreadMessages: unreadMessages, readMessages: readMessages, key: 0, checked: "", msgCount: (unreadMessages.length+readMessages.length), branch: "", branchValue: "Select Branch"});
        }
      });
    }
  });
});

app.post("/showBranchMessages", function(req, res) {
  console.log(req.body);
  if(req.body.showOnlyUnread === "on" || req.body.showOnlyUnread === "checked"){
    Teachermessage.find({subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, status: "Unread", branch: req.body.branch, todaysDate: req.body.attendanceDate}, function(err, unreadMessages){
      if(err){
        console.log(err);
      }else{
        Teachermessage.find({subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, status: "Read", branch: req.body.branch, todaysDate: req.body.attendanceDate}, function(err, readMessages){
          if(err){
            console.log(err);
          }else{
            res.render("viewBranchMessages", {teacherName: req.body.teacherName, subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, unreadMessages: unreadMessages, readMessages: [], key: 0, checked: "checked", msgCount: (unreadMessages.length+readMessages.length), branch: req.body.branch, attendanceDate: req.body.attendanceDate});
          }
        });
      }
    });
  }else{
    Teachermessage.find({subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, status: "Unread", branch: req.body.branch, todaysDate: req.body.attendanceDate}, function(err, unreadMessages){
      if(err){
        console.log(err);
      }else{
        Teachermessage.find({subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, status: "Read", branch: req.body.branch, todaysDate: req.body.attendanceDate}, function(err, readMessages){
          if(err){
            console.log(err);
          }else{
            console.log(req.body.teacherName);
            res.render("viewBranchMessages", {teacherName: req.body.teacherName, subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, unreadMessages: unreadMessages, readMessages: readMessages, key: 0, checked: "", msgCount: (unreadMessages.length+readMessages.length), branch: req.body.branch, attendanceDate: req.body.attendanceDate});
          }
        });
      }
    });
  }
});

app.post("/showMessages", function(req, res) {
  console.log(req.body);
  let date = new Date();
  date.setDate(date.getDate() - 15);
  let branchSelected;
  if(req.body.branch === "All Branches"){
    req.body.branch = "";
  }
  if(req.body.branch === ""){
    branchSelected = "Select Branch";
    if(req.body.showOnlyUnread === "on" || req.body.showOnlyUnread === "checked"){
      Teachermessage.find({subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, status: "Unread", "createdAt": {"$gte": date}}, function(err, unreadMessages){
        if(err){
          console.log(err);
        }else{
          Teachermessage.find({subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, status: "Read", "createdAt": {"$gte": date}}, function(err, readMessages){
            if(err){
              console.log(err);
            }else{
              res.render("viewmessages", {teacherName: req.body.teacherName, subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, unreadMessages: unreadMessages, readMessages: [], key: 0, checked: "checked", msgCount: (unreadMessages.length+readMessages.length), branch: "", branchValue: branchSelected});
            }
          });
        }
      });
    }else{
      Teachermessage.find({subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, status: "Unread", "createdAt": {"$gte": date}}, function(err, unreadMessages){
        if(err){
          console.log(err);
        }else{
          Teachermessage.find({subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, status: "Read", "createdAt": {"$gte": date}}, function(err, readMessages){
            if(err){
              console.log(err);
            }else{
              console.log(req.body.teacherName);
              res.render("viewmessages", {teacherName: req.body.teacherName, subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, unreadMessages: unreadMessages, readMessages: readMessages, key: 0, checked: "", msgCount: (unreadMessages.length+readMessages.length), branch: "", branchValue: branchSelected});
            }
          });
        }
      });
    }
  }else{
    branchSelected = req.body.branch;
    if(req.body.showOnlyUnread === "on" || req.body.showOnlyUnread === "checked"){
      Teachermessage.find({subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, branch: req.body.branch, status: "Unread", "createdAt": {"$gte": date}}, function(err, unreadMessages){
        if(err){
          console.log(err);
        }else{
          Teachermessage.find({subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, branch: req.body.branch, status: "Read", "createdAt": {"$gte": date}}, function(err, readMessages){
            if(err){
              console.log(err);
            }else{
              res.render("viewmessages", {teacherName: req.body.teacherName, subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, unreadMessages: unreadMessages, readMessages: [], key: 0, checked: "checked", msgCount: (unreadMessages.length+readMessages.length), branch: req.body.branch, branchValue: branchSelected});
            }
          });
        }
      });
    }else{
      Teachermessage.find({subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, branch: req.body.branch, status: "Unread", "createdAt": {"$gte": date}}, function(err, unreadMessages){
        if(err){
          console.log(err);
        }else{
          Teachermessage.find({subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, branch: req.body.branch, status: "Read", "createdAt": {"$gte": date}}, function(err, readMessages){
            if(err){
              console.log(err);
            }else{
              console.log(req.body.teacherName);
              res.render("viewmessages", {teacherName: req.body.teacherName, subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, unreadMessages: unreadMessages, readMessages: readMessages, key: 0, checked: "", msgCount: (unreadMessages.length+readMessages.length), branch: req.body.branch, branchValue: branchSelected});
            }
          });
        }
      });
    }
  }
});

app.post("/viewbranchmessages", function(req, res) {
  console.log(req.body);
  const myArr = req.body.attendanceDate.split("-");
  let todaysDate = "";
  let day = parseInt(myArr[2]);
  if(day >= 1 && day <= 9){
    day = "0" + day;
  }
  let month = parseInt(myArr[1]);
  if(month >= 1 && month <= 9){
    month = "0" + month;
  }
  let year = parseInt(myArr[0]);
  todaysDate += day + "/" + month + "/" + year;
  Teachermessage.find({subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, status: "Unread", branch: req.body.branch, todaysDate: todaysDate}, function(err, unreadMessages){
    if(err){
      console.log(err);
    }else{
      Teachermessage.find({subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, status: "Read", branch: req.body.branch, todaysDate: todaysDate}, function(err, readMessages){
        if(err){
          console.log(err);
        }else{
          console.log(req.body.teacherName);
          res.render("viewBranchMessages", {teacherName: req.body.teacherName, subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, unreadMessages: unreadMessages, readMessages: readMessages, key: 0, checked: "", msgCount: (unreadMessages.length+readMessages.length), branch: req.body.branch, attendanceDate: todaysDate});
        }
      });
    }
  });
});

app.post("/viewspecificbranchmessage", function(req, res) {
  Teachermessage.updateOne({_id: req.body.messageId}, {status: "Read"}, function(err, result) {
    if(err){
      console.log(err);
    }else{
      Teachermessage.findOne({_id: req.body.messageId}, function(err, result) {
        if(err){
          console.log(err);
        }else{
          res.render("viewSpecificBranchMessage", {teacherName: req.body.teacherName, subjectCode:req.body.subjectCode, facultyCode: req.body.facultyCode, msg: result, showOnlyUnread: req.body.showOnlyUnread, branch: req.body.branch, attendanceDate: req.body.attendanceDate});
        }
      });
    }
  });
});

app.post("/viewspecificmessage", function(req, res) {
  console.log(req.body);
  if(req.body.branch === "All Branches"){
    req.body.branch = "";
  }
  Teachermessage.updateOne({_id: req.body.messageId}, {status: "Read"}, function(err, result) {
    if(err){
      console.log(err);
    }else{
      Teachermessage.findOne({_id: req.body.messageId}, function(err, result) {
        if(err){
          console.log(err);
        }else{
          res.render("viewspecificmessage", {teacherName: req.body.teacherName, subjectCode:req.body.subjectCode, facultyCode: req.body.facultyCode, msg: result, showOnlyUnread: req.body.showOnlyUnread, branch: req.body.branch});
        }
      });
    }
  });
});

app.post("/tryagain", function(req, res) {
  res.redirect("/studentHome");
});

app.post("/takemehome", function(req, res) {
  res.redirect("/teacherHome");
});

app.post("/pushattendance", function(req, res) {
  console.log(req.body);
  const d = new Date();
  let todaysDate = "";
  let date = d.getDate();
  if(date >= 0 && date <= 9){
    date = "0" + date;
  }
  let month = d.getMonth() + 1;
  if(month >= 1 && month <= 9){
    month = "0" + month;
  }
  let year = d.getFullYear();
  todaysDate += date + "/" + month + "/" + year;
  let currTime = "";
  let hour = d.getHours();
  if(hour >= 0 && hour <= 9){
    hour = "0" + hour;
  }
  let minute = d.getMinutes();
  if(minute >= 0 && minute <= 9){
    minute = "0" + minute;
  }
  let second = d.getSeconds();
  if(second >= 0 && second <= 9){
    second = "0" + second;
  }
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
    res.render("uploadImages", {errors, studentName: req.body.studentName, enrollmentno: req.body.enrollmentno});
  }else{
    const imagesuploaded = new UploadedImages({
      enrollmentno: req.body.enrollmentno,
      firstImagePath: "Link1",
      secondImagePath: "Link2",
      thirdImagePath: "Link3"
    });
    imagesuploaded.save();
    const query = {enrollmentno: req.body.enrollmentno};
    let img1 = false, img2 = false, img3 = false;
    cloudinary.uploader.upload(firstImage.tempFilePath, (err, result) => {
      const firstLink = result.url;
      UploadedImages.findOneAndUpdate(query, {firstImagePath: firstLink}, function(err, result){
        if(err){
          console.log(err);
        }else{
          img1 = true;
          console.log("first");
          if(img1 && img2 && img3){
            console.log("final");
            res.redirect("/studentHome");
          }
        }
      });
    });
    cloudinary.uploader.upload(secondImage.tempFilePath, (err, result) => {
      const secondLink = result.url;
      UploadedImages.findOneAndUpdate(query, {secondImagePath: secondLink}, function(err, result){
        if(err){
          console.log(err);
        }else{
          img2 = true;
          console.log("second");
          if(img1 && img2 && img3){
            console.log("final");
            res.redirect("/studentHome");
          }
        }
      });
    });
    cloudinary.uploader.upload(thirdImage.tempFilePath, (err, result) => {
      const thirdLink = result.url;
      UploadedImages.findOneAndUpdate(query, {thirdImagePath: thirdLink}, function(err, result){
        if(err){
          console.log(err);
        }else{
          img3 = true;
          console.log("third");
          if(img1 && img2 && img3){
            console.log("final");
            res.redirect("/studentHome");
          }
        }
      });
    });
  }
});

app.post("/attendanceFull", function(req, res) {
  console.log(req.body);
  const d = new Date();
  const month = d.getMonth() + 1;
  Teachermessage.find({enrollmentno: req.body.enrollmentno, subjectCode: req.body.subjectCode, currMonth: month}, function(err, result) {
    if(err){
      console.log(err);
    }else{
      if(result.length === 3){
        res.render("messages", {msg: "Can't message teacher more than three times in a month.", studentName: req.body.studentName, imageUploaded: req.body.imageUploaded, buttonText: "Home"});
      }else{
        res.render("messageTeacher", {studentName: req.body.studentName, username: req.body.username, enrollmentno: req.body.enrollmentno, branch: req.body.branch, subjectCode: req.body.subjectCode, facultyCode: req.body.facultyCode, imageUploaded: req.body.imageUploaded});
      }
    }
  });
});

app.post("/messageTeacher", function(req, res) {
  console.log(req.body);
  const d = new Date();
  let todaysDate = "";
  let date = d.getDate();
  if(date >= 1 && date <= 9){
    date = "0" + date;
  }
  let month = d.getMonth() + 1;
  if(month >= 1 && month <= 9){
    month = "0" + month;
  }
  let year = d.getFullYear();
  todaysDate += date + "/" + month + "/" + year;
  let currTime = "";
  let hour = d.getHours();
  if(hour >= 0 && hour <= 9){
    hour = "0" + hour;
  }
  let minute = d.getMinutes();
  if(minute >= 0 && minute <= 9){
    minute = "0" + minute;
  }
  let second = d.getSeconds();
  if(second >= 0 && second <= 9){
    second = "0" + second;
  }
  currTime += hour + ":" + minute + ":" + second;
  const messageToTeacher = new Teachermessage({
    studentName: req.body.studentName,
    username: req.body.username,
    enrollmentno: req.body.enrollmentno,
    branch: req.body.branch,
    imageUploaded: req.body.imageUploaded,
    subjectCode: req.body.subjectCode,
    facultyCode: req.body.facultyCode,
    message: req.body.messageForTeacher,
    status: "Unread",
    currMonth: month,
    todaysDate: todaysDate,
    currTime: currTime
  });
  messageToTeacher.save();
  res.render("messages", {msg: "Message sent!", studentName: req.body.studentName, imageUploaded: req.body.imageUploaded, buttonText: "Home"});
});

app.post("/studentRegister", function(req, res) {
  console.log(req.body);
  const email = req.body.username;
  const studentName = req.body.studentName;
  const enrollmentno = req.body.enrollmentno;
  const branch = req.body.branch;
  let errors = [];
  if (req.body.branch === "") {
    errors.push({msg: "Please Select branch"});
  }
  if (errors.length > 0) {
    res.render("studentRegister", {errors, studentName, email, enrollmentno, branch});
  }else{
    if(/^[a-zA-Z]+$/.test(req.body.studentName) === false){
      errors.push({msg: "Please enter correct name"});
    }
    if(errors.length > 0){
      res.render("studentRegister", {errors, studentName, email, enrollmentno, branch});
    }else{
      if (req.body.password.length < 6) {
        errors.push({msg: "Password should be atleast 6 characters"});
      }
      if (req.body.password.length > 15) {
        errors.push({msg: "Password should not exceed 15 characters"});
      }
      if (errors.length > 0) {
        res.render("studentRegister", {errors, studentName, email, enrollmentno, branch});
      } else {
        if (req.body.enrollmentno.length != 11) {
          errors.push({msg: "Enrollment Number should have 11 digits"});
        }
        if (errors.length > 0) {
          res.render("studentRegister", {errors, studentName, email, enrollmentno, branch});
        } else {
          if (req.body.enrollmentno.match(/^[0-9]+$/) == null) {
            errors.push({msg: "Enrollment Number should consist of digits only"});
          }
          if (errors.length > 0) {
            res.render("studentRegister", {errors, studentName, email, enrollmentno, branch});
          } else {
              Student.findOne({enrollmentno: req.body.enrollmentno}, function(err, result) {
                if(err){
                  console.log(err);
                }else{
                  if (result != null) {
                    errors.push({msg: "Invalid Enrollment Number"});
                  }
                  if (errors.length > 0) {
                    res.render("studentRegister", {errors, studentName, email, enrollmentno, branch});
                  }else{
                    Student.register({username: req.body.username, studentName: req.body.studentName, enrollmentno: req.body.enrollmentno, branch: req.body.branch, role: "Student"}, req.body.password, function(err, user) {
                      if (err) {
                        errors.push({msg: "Email is already registered"})
                        res.render("studentRegister", {errors, studentName,email, enrollmentno, branch});
                      } else {
                        passport.authenticate("student-local")(req, res, function() {
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
  }
});

app.post("/teacherRegister", function(req, res) {
  console.log(req.body);
  const email = req.body.username;
  const teacherName = req.body.teacherName;
  const facultyCode = req.body.facultyCode;
  const subjectCode = req.body.subjectCode;
  let errors = [];
  if(req.body.facultyCode === ""){
    errors.push({msg: "Please Select Faculty Code"});
  }
  if(errors.length > 0){
    res.render("teacherRegister", {errors, teacherName, email, facultyCode});
  }else{
    if (req.body.password.length < 6) {
      errors.push({msg: "Password should be atleast 6 characters"});
    }
    if (req.body.password.length > 15) {
      errors.push({msg: "Password should not exceed 15 characters"});
    }
    if(errors.length > 0){
      res.render("teacherRegister", {errors, teacherName, email, facultyCode});
    }else{
      if(req.body.collegeCode != college_code){
        errors.push({msg: "Incorrect College Code"});
      }
      if(errors.length > 0){
        res.render("teacherRegister", {errors, teacherName, email, facultyCode});
      }else{
        Teacher.register({username: req.body.username, teacherName: req.body.teacherName, facultyCode: req.body.facultyCode, subjectCode: req.body.subjectCode, role: "Teacher"}, req.body.password, function(err, user) {
          if (err) {
            errors.push({msg: "Email is already registered"})
            res.render("teacherRegister", {errors, teacherName, email, facultyCode});
          } else {
            passport.authenticate("teacher-local")(req, res, function() {
              res.redirect("/teacherHome");
            });
          }
        });
      }
    }
  }
});

app.post("/studentLogin", passport.authenticate("student-local", {
  successRedirect: "/studentHome",
  failureRedirect: "/studentLogin",
  failureFlash: true
}));

app.post("/teacherLogin", passport.authenticate("teacher-local", {
  successRedirect: "/teacherHome",
  failureRedirect: "/teacherLogin",
  failureFlash: true
}));

app.get("/studentLogout", ensureAuthStudent, function(req, res) {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/studentLogin");
});

app.get("/teacherLogout", ensureAuthTeacher, function(req, res) {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/teacherLogin");
});

function ensureAuthStudent(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error_msg", "Please login to view this page");
    res.redirect("/studentLogin");
  }
}

function ensureGuestStudent(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect("/studentHome");
  } else {
    return next();
  }
}

function ensureAuthTeacher(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("error_msg", "Please login to view this page");
    res.redirect("/teacherLogin");
  }
}

function ensureGuestTeacher(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect("/teacherHome");
  } else {
    return next();
  }
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
  console.log(`The server is running on port ${PORT}.`);
});
