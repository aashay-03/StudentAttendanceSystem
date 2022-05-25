const subCode = document.querySelector(".hidden-subcode");
const facultyCode = document.querySelector(".facultycode");
const facCode = document.querySelector(".hidden-faccode");
const attendanceBox = document.querySelector(".attendance-box");

var x, i, j, l, ll, selElmnt, a, b, c;
x = document.getElementsByClassName("custom-select");
l = x.length;
for (i = 0; i < l; i++) {
  selElmnt = x[i].getElementsByTagName("select")[0];
  ll = selElmnt.length;
  a = document.createElement("DIV");
  a.setAttribute("class", "select-selected");
  a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
  x[i].appendChild(a);
  b = document.createElement("DIV");
  b.setAttribute("class", "select-items select-hide");
  for (j = 1; j < ll; j++) {
    c = document.createElement("DIV");
    c.innerHTML = selElmnt.options[j].innerHTML;
    c.addEventListener("click", function(e) {
      var y, i, k, s, h, sl, yl;
      s = this.parentNode.parentNode.getElementsByTagName("select")[0];
      sl = s.length;
      h = this.parentNode.previousSibling;
      for (i = 0; i < sl; i++) {
        if (s.options[i].innerHTML == this.innerHTML) {
          s.selectedIndex = i;
          h.innerHTML = this.innerHTML;
          const selectedVal = this.innerHTML;
          switch(selectedVal){
            case "ETCS-202":
              facultyCode.value = "CDG";
              break;
            case "ETCS-204":
              facultyCode.value = "MAK";
              break;
            case "ETCS-206":
              facultyCode.value = "PMA";
              break;
            case "ETCS-208":
              facultyCode.value = "CPS";
              break;
            case "ETCS-302":
              facultyCode.value = "MNG";
              break;
            case "ETCS-304":
              facultyCode.value = "PSJ";
              break;
            case "ETCS-306":
              facultyCode.value = "DKD";
              break;
            case "ETCS-308":
              facultyCode.value = "MSB";
              break;
            case "ETCS-252":
              facultyCode.value = "SAK";
              break;
            case "ETCS-254":
              facultyCode.value = "FAG";
              break;
            case "ETCS-356":
              facultyCode.value = "OAK";
              break;
            case "ETCS-358":
              facultyCode.value = "TSN";
          }
          y = this.parentNode.getElementsByClassName("same-as-selected");
          yl = y.length;
          for (k = 0; k < yl; k++) {
            y[k].removeAttribute("class");
          }
          this.setAttribute("class", "same-as-selected");
          break;
        }
      }
      h.click();
    });
    b.appendChild(c);
  }
  x[i].appendChild(b);
  a.addEventListener("click", function(e) {
    e.stopPropagation();
    closeAllSelect(this);
    this.nextSibling.classList.toggle("select-hide");
    this.classList.toggle("select-arrow-active");
    attendanceBox.classList.toggle("adjust-height");
  });
}

function closeAllSelect(elmnt) {
  var x, y, i, xl, yl, arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  subCode.value = y[0].innerHTML;
  facCode.value = facultyCode.value;
  xl = x.length;
  yl = y.length;
  for (i = 0; i < yl; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i)
    } else {
      y[i].classList.remove("select-arrow-active");
      attendanceBox.classList.remove("adjust-height");
    }
  }
  for (i = 0; i < xl; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}

document.addEventListener("click", closeAllSelect);

function backToHome() {
  location.href = "http://localhost:3000/studentHome";
}
