const input = document.querySelector(".pass");
const showBtn = document.querySelector(".showBtn");
const eyePatch = document.querySelector(".eye-image");
const myInput = document.querySelector(".hidden-input");
const subjectCode = document.querySelector(".subjectcode");
const subCode = document.querySelector(".hidden-subcode");

function trigger() {
  if (input.value != "") {
    showBtn.style.display = "block";
    showBtn.onclick = function() {
      if (input.type == "password") {
        input.type = "text";
        eyePatch.src = "./images/hidden.png";
      } else {
        input.type = "password";
        eyePatch.src = "./images/eye.png";
      }
    }
  } else {
    showBtn.style.display = "none";
  }
}

/* ############### Custom Dropdown Menu ############### */

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
      myInput.value = this.innerHTML;
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
            case "CDG":
              subjectCode.value = "ETCS-202";
              break;
            case "MAK":
              subjectCode.value = "ETCS-204";
              break;
            case "PMA":
              subjectCode.value = "ETCS-206";
              break;
            case "CPS":
              subjectCode.value = "ETCS-208";
              break;
            case "MNG":
              subjectCode.value = "ETCS-302";
              break;
            case "PSJ":
              subjectCode.value = "ETCS-304";
              break;
            case "DKD":
              subjectCode.value = "ETCS-306";
              break;
            case "MSB":
              subjectCode.value = "ETCS-308";
              break;
            case "SAK":
              subjectCode.value = "ETCS-252";
              break;
            case "FAG":
              subjectCode.value = "ETCS-254";
              break;
            case "OAK":
              subjectCode.value = "ETCS-356";
              break;
            case "TSN":
              subjectCode.value = "ETCS-358";
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
  });
}

function closeAllSelect(elmnt) {
  var x, y, i, xl, yl, arrNo = [];
  x = document.getElementsByClassName("select-items");
  y = document.getElementsByClassName("select-selected");
  subCode.value = subjectCode.value;
  xl = x.length;
  yl = y.length;
  for (i = 0; i < yl; i++) {
    if (elmnt == y[i]) {
      arrNo.push(i)
    } else {
      y[i].classList.remove("select-arrow-active");
    }
  }
  for (i = 0; i < xl; i++) {
    if (arrNo.indexOf(i)) {
      x[i].classList.add("select-hide");
    }
  }
}

document.addEventListener("click", closeAllSelect);
