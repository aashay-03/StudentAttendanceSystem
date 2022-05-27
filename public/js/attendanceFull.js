const buttonValue = document.querySelector(".imp-info");
const attendanceFullForm = document.querySelector(".attendance-full-form");
const viewMessageForm = document.querySelector(".view-message-form");

if(buttonValue.innerHTML === "Message Teacher"){
  attendanceFullForm.style.display = "block";
}else{
  viewMessageForm.style.display = "block";
}
