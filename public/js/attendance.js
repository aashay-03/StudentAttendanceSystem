let video = document.querySelector(".video");
let para = document.querySelector(".videoDesc");
let box = document.querySelector(".video-box");
let tryAgainButton = document.querySelector(".try-again-btn");
let message = document.querySelector(".msg-textbox");
const studentName = document.querySelector(".imp-info");
const firstImage = document.querySelector(".first-image");
const attendanceForm = document.querySelector(".push-attendance-form");
const giveAttendanceForm = document.querySelector(".give-attendance-form");
const attemptsLeft = document.querySelector(".tries-rem");
const triesRem = document.querySelector(".attempts-left");
const myLabel = studentName.innerHTML;
const startTime = new Date();

var match = 0, notmatch = 0, total = 0;

var myFunction = setInterval(updateTime, 1000);

function updateTime(){
  let currTime = new Date();
  let diff = currTime - startTime;
  if(diff >= 35000){
    if(match < 33){
      match = 0;
      notmatch = 0;
    }
    stopFunction();
    clearInterval(myFunction);
  }
}

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models")
]).then(start)


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
  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.7);

  video.addEventListener("play", () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    box.append(canvas);

    const displaySize = {width: video.width, height: video.height}
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
      let currTime = new Date();
      let diff = currTime - startTime;
      if(detections.length === 1){
        para.style.display = "block";
        para.innerHTML = "Scanning Face...";
        para.style.color = "#0e3564";
      }else if(detections.length === 0){
        if(diff >= 35000){
          para.style.display = "none";
        }else{
          para.style.display = "block";
          para.innerHTML = "Unable to detect a face. Please align your face with the webcam or check the camera quality";
          para.style.color = "red";
        }
      }
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

      const results = resizedDetections.map((d) => {
        return faceMatcher.findBestMatch(d.descriptor);
      });
      total = match + notmatch;
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
        const drawBox = new faceapi.draw.DrawBox(box, {label: "Scanning Face"});
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
        const img = await faceapi.fetchImage(firstImage.innerHTML);
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
        descriptions.push(detections.descriptor);
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
    try {
      document.querySelector("canvas").style.display = "none";
    } catch (e) {
      console.log(e);
    }
    if(triesRem.innerHTML == 0){
      giveAttendanceForm.submit();
    }else{
      message.innerHTML = "Taking too long to detect a face. Please check the camera quality and try again. Ensure that your face is in line with the webcam.";
      message.style.color = "#FF2400";
      tryAgainButton.style.display = "block";
      attemptsLeft.style.display = "block";
      attemptsLeft.style.color = "red";
    }
  }else if(match < 33){
    document.querySelector("canvas").style.display = "none";
    if(triesRem.innerHTML == 0){
      giveAttendanceForm.submit();
    }else{
      message.innerHTML = "Unable to detect a face. Please try again.";
      message.style.color = "#FF2400";
      tryAgainButton.style.display = "block";
      attemptsLeft.style.display = "block";
      attemptsLeft.style.color = "red";
    }
  }else{
    document.querySelector("canvas").style.display = "none";
    message.innerHTML = "Attendance was recorded successfully in the system.";
    message.style.color = "#018749";
    attendanceForm.submit();
    return;
  }
}
