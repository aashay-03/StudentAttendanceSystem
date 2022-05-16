let video = document.querySelector(".video");
let para = document.querySelector(".videoDesc");
let box = document.querySelector(".video-box");
let tryAgainButton = document.querySelector(".try-again-btn");
let message = document.querySelector(".msg-textbox");
let pushToDB = document.querySelector(".push-attendance-to-db");
const studentName = document.querySelector(".imp-info");
const firstImage = document.querySelector(".first-image");
const secondImage = document.querySelector(".second-image");
const thirdImage = document.querySelector(".third-image");
const alertMsg = document.querySelector(".alert-msg");
const display = document.querySelector(".time");
const myArr = [firstImage.innerHTML, secondImage.innerHTML, thirdImage.innerHTML];
const myLabel = studentName.innerHTML;
const startTime = new Date();
console.log(startTime);
var fiveMinutes = 300;
var match = 0;
var notmatch = 0;
var total = 0;

var myFunction = setInterval(updateTime, 1000);

function updateTime(){
  var currTime = new Date();
  var diff = currTime - startTime;
  console.log(diff);
  if(diff > 60000){
    if(match < 35){
      match = 0;
      notmatch = 0;
    }
    stopFunction();
    clearInterval(myFunction);
  }
}

function takeAttendance() {
  Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.ssdMobilenetv1.loadFromUri("/models")
  ]).then(start)
}

function start() {
  match = 0;
  notmatch = 0;
  total = 0;
  tryAgainButton.style.display = "none";
  message.style.display = "none";
  video.style.display = "block";
  if (navigator.mediaDevices.getUserMedia === undefined) {
    para.style.display = "block";
    para.innerHTML = "The application can't run on this browser. Please try on another browser";
    para.style.color = "red";
  }else{
    navigator.mediaDevices.getUserMedia({
        video: true
      })
      .then(function(mediaStream) {
        video.srcObject = mediaStream;
        var currTime = new Date();
        console.log(currTime);
        para.style.display = "block";
        para.style.color = "black";
      })
      .catch(function(err) {
        para.style.display = "block";
        para.innerHTML = "Please allow access to camera and refresh browser";
        para.style.color = "red";
      });
      recognizeFaces();
  }
}

async function recognizeFaces() {
  const labeledDescriptors = await loadLabeledImages();
  console.log(labeledDescriptors);
  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.7);

  video.addEventListener("play", () => {
    console.log("Video is playing");
    para.innerHTML = "Detecting Face...";
    const canvas = faceapi.createCanvasFromMedia(video);
    box.append(canvas);

    const displaySize = {width: video.width, height: video.height}
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

      const results = resizedDetections.map((d) => {
        return faceMatcher.findBestMatch(d.descriptor);
      });
      total = match + notmatch;
      console.log(total);
      console.log(match);
      console.log(notmatch);
      if (total >= 40) {
        stopFunction();
        clearInterval(myFunction);
        return;
      }
      results.forEach((result, i) => {
        const matchValue = result._label;
        if (matchValue === myLabel) {
          match++;
        } else {
          notmatch++;
        }
        var dist = result._distance;
        dist = dist.toFixed(2);
        const box = resizedDetections[i].detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, {label: "Scanning Face " + dist})
        drawBox.draw(canvas);
      })
    }, 1000);
  })
}

function loadLabeledImages() {
  const labels = [myLabel];
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      for (let i = 0; i < 3; i++) {
        const img = await faceapi.fetchImage(myArr[i]);
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
        descriptions.push(detections.descriptor);
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  )
}

function stopFunction() {
  const mediaStream = video.srcObject;
  const tracks = mediaStream.getTracks();
  tracks[0].stop();
  video.style.display = "none";
  para.style.display = "none";
  message.style.display = "block";
  if(match === 0 && notmatch === 0){
    message.innerHTML = "Taking too long to detect face. Please check camera quality and try again. Ensure that your face is properly aligned with the webcam.";
    message.style.color = "red";
    tryAgainButton.style.display = "block";
  }else if(match < 35){
    message.innerHTML = "Unable to detect face. Please try again.";
    message.style.color = "red";
    tryAgainButton.style.display = "block";
  }else{
    message.innerHTML = "Attendance taken successfully. Please press 'OK' to push your attendance in database.";
    message.style.color = "green";
    pushToDB.style.display = "block";
    alertMsg.style.display = "block";
    startTimer(fiveMinutes, display);
  }
}

function startTimer(duration, display) {
    var timer = duration;
    var minutes;
    var seconds;
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    display.textContent = minutes + ":" + seconds;
    fiveMinutes--;
    if(fiveMinutes < 0){
       window.location.href = "http://localhost:3000";
    }
}
