const message = document.querySelector(".msg-textbox");

if(message.innerHTML === "Attendance was recorded successfully in the system." || message.innerHTML === "Attendance is already marked for this subject." || message.innerHTML === "Message sent!"){
  message.style.color = "green";
}else{
  message.style.color = "red";
}

function backToHome() {
  location.href = "http://localhost:3000/studentHome";
}
