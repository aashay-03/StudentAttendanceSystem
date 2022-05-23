const firstImage = document.querySelector("#firstFile");
const secondImage = document.querySelector("#secondFile");
const thirdImage = document.querySelector("#thirdFile");
const firstLabel = document.querySelector(".first-sl");
const secondLabel = document.querySelector(".second-sl");
const thirdLabel = document.querySelector(".third-sl");
const submitBtn = document.querySelector(".submitBtn");
const displayBtn = document.querySelector(".displayBtn");
const studentName = document.querySelector(".imp-info");
const errorMsg = document.querySelector(".error-msg");
const myLabel = studentName.innerHTML;
var firstPhoto, secondPhoto, thirdPhoto, myArr;
var len1 = 0, len2 = 0, len3 = 0, match = 0, notmatch = 0;

submitBtn.style.display = "none";
displayBtn.style.display = "block";

setInterval(checkConditions, 1000);

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models")
]).then(start)

function start() {
  firstImage.addEventListener("change", async() => {
    try {
      submitBtn.style.display = "none";
      displayBtn.style.display = "block";
      firstPhoto = await faceapi.bufferToImage(firstImage.files[0]);
      const ext1 = firstPhoto.src.substring(11, 15);
      if(isImage(ext1)){
        submitBtn.style.display = "none";
        displayBtn.style.display = "block";
        firstLabel.style.visibility = "hidden";
        const detections = await faceapi.detectAllFaces(firstPhoto).withFaceLandmarks().withFaceDescriptors();
        const len = detections.length;
        if(len === 0){
          len1 = 0;
          firstLabel.innerHTML = "No face detected. Choose another image";
          firstLabel.style.visibility = "visible";
        }else if(len > 1){
          len1 = 0;
          firstLabel.innerHTML = "More than one face detected. Choose another image";
          firstLabel.style.visibility = "visible";
        }else{
          len1 = 1;
          submitBtn.style.display = "none";
          displayBtn.style.display = "block";
          firstLabel.style.visibility = "hidden";
        }
      }else{
        len1 = 0;
        firstLabel.innerHTML = "Invalid File Type";
        firstLabel.style.visibility = "visible";
      }
    } catch (err) {
      console.log(err);
      if(err.type === "error"){
        len1 = 0;
        firstLabel.innerHTML = "Invalid File Type";
        firstLabel.style.visibility = "visible";
      }else{
        len1 = 0;
        firstLabel.style.visibility = "hidden";
      }
    }
  });

  secondImage.addEventListener("change", async() => {
    try {
      submitBtn.style.display = "none";
      displayBtn.style.display = "block";
      secondPhoto = await faceapi.bufferToImage(secondImage.files[0]);
      const ext2 = secondPhoto.src.substring(11, 15);
      if(isImage(ext2)){
        submitBtn.style.display = "none";
        displayBtn.style.display = "block";
        secondLabel.style.visibility = "hidden";
        const detections = await faceapi.detectAllFaces(secondPhoto).withFaceLandmarks().withFaceDescriptors();
        const len = detections.length;
        if(len === 0){
          len2 = 0;
          secondLabel.innerHTML = "No face detected. Choose another image";
          secondLabel.style.visibility = "visible";
        }else if(len > 1){
          len2 = 0;
          secondLabel.innerHTML = "More than one face detected. Choose another image";
          secondLabel.style.visibility = "visible";
        }else{
          len2 = 1;
          submitBtn.style.display = "none";
          displayBtn.style.display = "block";
          secondLabel.style.visibility = "hidden";
        }
      }else{
        len2 = 0;
        secondLabel.innerHTML = "Invalid File Type";
        secondLabel.style.visibility = "visible";
      }
    } catch (err) {
      console.log(err);
      if(err.type === "error"){
        len2 = 0;
        secondLabel.innerHTML = "Invalid File Type";
        secondLabel.style.visibility = "visible";
      }else{
        len2 = 0;
        secondLabel.style.visibility = "hidden";
      }
    }
  });

  thirdImage.addEventListener("change", async() => {
    try {
      submitBtn.style.display = "none";
      displayBtn.style.display = "block";
      thirdPhoto = await faceapi.bufferToImage(thirdImage.files[0]);
      const ext3 = thirdPhoto.src.substring(11, 15);
      if(isImage(ext3)){
        submitBtn.style.display = "none";
        displayBtn.style.display = "block";
        thirdLabel.style.visibility = "hidden";
        const detections = await faceapi.detectAllFaces(thirdPhoto).withFaceLandmarks().withFaceDescriptors();
        const len = detections.length;
        if(len === 0){
          len3 = 0;
          thirdLabel.innerHTML = "No face detected. Choose another image";
          thirdLabel.style.visibility = "visible";
        }else if(len > 1){
          len3 = 0;
          thirdLabel.innerHTML = "More than one face detected. Choose another image";
          thirdLabel.style.visibility = "visible";
        }else{
          len3 = 1;
          submitBtn.style.display = "none";
          displayBtn.style.display = "block";
          thirdLabel.style.visibility = "hidden";
        }
      }else{
        len3 = 0;
        thirdLabel.innerHTML = "Invalid File Type";
        thirdLabel.style.visibility = "visible";
      }
    } catch (err) {
      console.log(err);
      if(err.type === "error"){
        len3 = 0;
        thirdLabel.innerHTML = "Invalid File Type";
        thirdLabel.style.visibility = "visible";
      }else{
        len3 = 0;
        thirdLabel.style.visibility = "hidden";
      }
    }
  });
}

function isImage(ext){
  submitBtn.style.display = "none";
  displayBtn.style.display = "block";
  if(ext === "png;" || ext === "jpeg"){
    submitBtn.style.display = "none";
    displayBtn.style.display = "block";
    return true;
  }else{
    submitBtn.style.display = "none";
    displayBtn.style.display = "block";
    return false;
  }
}

function checkConditions() {
  if(len1 === 1 && len2 === 1 && len3 === 1){
    submitBtn.style.display = "none";
    displayBtn.style.display = "block";
    myArr = [secondPhoto, thirdPhoto, firstPhoto];
    photosMatch();
    submitBtn.style.display = "none";
    displayBtn.style.display = "block";
    if(match === 1 && notmatch === 0){
      submitBtn.style.display = "block";
      displayBtn.style.display = "none";
      errorMsg.style.visibility = "hidden";
    }else{
      submitBtn.style.display = "none";
      displayBtn.style.display = "block";
      errorMsg.style.visibility = "visible";
    }
  }else{
    submitBtn.style.display = "none";
    displayBtn.style.display = "block";
    errorMsg.style.visibility = "hidden";
  }
}

async function photosMatch() {
  submitBtn.style.display = "none";
  displayBtn.style.display = "block";
  const labeledFaceDescriptors = await loadLabeledImages();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
  const displaySize = { width: myArr[2].width, height: myArr[2].height }
  const detections = await faceapi.detectAllFaces(myArr[2]).withFaceLandmarks().withFaceDescriptors();
  const resizedDetections = faceapi.resizeResults(detections, displaySize);
  const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
  submitBtn.style.display = "none";
  displayBtn.style.display = "block";
  if(results[0]._label === "unknown"){
    match = 0;
    notmatch = 1;
    submitBtn.style.display = "none";
    displayBtn.style.display = "block";
    return;
  }else{
    match = 1;
    notmatch = 0;
    submitBtn.style.display = "block";
    displayBtn.style.display = "none";
    errorMsg.style.visibility = "hidden";
    return;
  }
}

function loadLabeledImages() {
  submitBtn.style.display = "none";
  displayBtn.style.display = "block";
  const labels = [myLabel];
  return Promise.all(
    labels.map(async label => {
      const descriptions = [];
      for (let i = 0; i < 2; i++) {
        const img = myArr[i];
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
        descriptions.push(detections.descriptor);
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  )
}
