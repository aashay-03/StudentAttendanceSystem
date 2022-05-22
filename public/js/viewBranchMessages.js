const msgCard = document.querySelectorAll(".message-card");
const status = document.querySelectorAll(".imp-info");

for(var i=0; i<msgCard.length; i++){
  if(status[i].innerHTML === "Unread"){
    msgCard[i].style.background = "#990033";
  }else{
    msgCard[i].style.background = "#00cc00";
  }
}

function backToHome() {
  location.href = "http://localhost:3000/teacherHome";
}
