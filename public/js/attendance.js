let video = document.querySelector(".video");
let para = document.querySelector(".videoDesc");
let box = document.querySelector(".video-box");
let tryAgainButton = document.querySelector(".try-again-btn");
let message = document.querySelector(".msg-textbox");
const studentName = document.querySelector(".imp-info");
const firstImage = document.querySelector(".first-image");
const secondImage = document.querySelector(".second-image");
const thirdImage = document.querySelector(".third-image");
const attendanceForm = document.querySelector(".push-attendance-form");
const myButton = document.querySelector(".btn");
const myArr = [firstImage.innerHTML, secondImage.innerHTML, thirdImage.innerHTML];
const myLabel = studentName.innerHTML;
const startTime = new Date();

var match = 0;
var notmatch = 0;
var total = 0;

var myFunction = setInterval(updateTime, 1000);

function updateTime(){
  var currTime = new Date();
  var diff = currTime - startTime;
  console.log(diff);
  if(diff > 45000){
    if(match < 110){
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
    para.innerHTML = "The application can't run on this browser. Please try on another browser.";
    para.style.color = "red";
  }else{
    navigator.mediaDevices.getUserMedia({
        video: true
      })
      .then(function(mediaStream) {
        video.srcObject = mediaStream;
        var currTime = new Date();
        para.innerHTML = "Detecting Face...";
        para.style.display = "block";
        para.style.color = "black";
      })
      .catch(function(err) {
        para.style.display = "block";
        para.innerHTML = "Please allow access to the camera. Refresh the browser after granting the permission.";
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
      if (total >= 120) {
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
    }, 100);
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
    message.innerHTML = "Taking too long to detect a face. Please check the camera quality and try again. Ensure that your face is in line with the webcam.";
    message.style.color = "red";
    tryAgainButton.style.display = "block";
  }else if(match < 110){
    document.querySelector("canvas").style.display = "none";
    message.innerHTML = "Unable to detect a face. Please try again.";
    message.style.color = "red";
    tryAgainButton.style.display = "block";
  }else{
    document.querySelector("canvas").style.display = "none";
    message.innerHTML = "Attendance was recorded successfully in the system.";
    message.style.color = "green";
    myButton.style.display = "block";
    attendanceForm.submit();
    return;
  }
}
