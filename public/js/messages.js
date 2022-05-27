const message = document.querySelector(".msg-textbox");
const msgInformation = document.querySelector(".imp-info");
const viewMessageForm = document.querySelector(".view-msg-form");
const viewAttendanceForm = document.querySelector(".view-attendance-form")

if(message.innerHTML === "Attendance was recorded successfully in the system." || message.innerHTML === "Attendance is already marked for this subject." || message.innerHTML === "Message sent!"){
  message.style.color = "#018749";
}else{
  message.style.color = "#FF2400";
}

if(msgInformation.innerHTML === "View Message"){
  viewMessageForm.style.display = "block";
}else if(msgInformation.innerHTML === "View Attendance"){
  viewAttendanceForm.style.display = "block";
}
