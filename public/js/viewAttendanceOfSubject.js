const attendanceStatus = document.querySelector(".attendance-status");
const attendanceText = document.querySelector(".attendance-text");

if(attendanceStatus.innerHTML === "Good" || attendanceStatus.innerHTML === "Fine"){
  attendanceText.style.color = "green";
}else{
  attendanceText.style.color = "red";
}

function backToHome() {
  location.href = "http://localhost:3000/studentHome";
}
