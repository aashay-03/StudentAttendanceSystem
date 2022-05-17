const message = document.querySelector(".msg-textbox");

if(message.innerHTML === "Attendance was recorded successfully in the system." || message.innerHTML === "Attendance is already marked for this subject."){
  message.style.color = "green";
}else{
  message.style.color = "red";
}
