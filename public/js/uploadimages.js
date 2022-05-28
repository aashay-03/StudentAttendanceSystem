const firstImage = document.querySelector("#firstFile");
const firstLabel = document.querySelector(".first-sl");
const submitBtn = document.querySelector(".submitBtn");
const displayBtn = document.querySelector(".displayBtn");

submitBtn.style.display = "none";
displayBtn.style.display = "block";

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
      const firstPhoto = await faceapi.bufferToImage(firstImage.files[0]);
      const ext = firstPhoto.src.substring(11, 15);
      if(isImage(ext)){
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
          submitBtn.style.display = "block";
          displayBtn.style.display = "none";
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
