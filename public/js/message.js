const timeRemaining = document.querySelector(".num");

setTimeout(function() {
  window.location.href = "http://localhost:3000";
}, 6000);

var i = 5;
setInterval(timer, 1000);

function timer() {
  timeRemaining.innerHTML = i;
  i--;
}
