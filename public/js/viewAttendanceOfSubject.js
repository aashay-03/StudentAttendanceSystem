const attendanceStatus = document.querySelector(".attendance-status");
const attendanceText = document.querySelector(".attendance-text");

if(attendanceStatus.innerHTML === "Good" || attendanceStatus.innerHTML === "Fine"){
  attendanceText.style.color = "#018749";
}else{
  attendanceText.style.color = "#FF2400";
}
