// DOM Elements
const videoInput = document.getElementById("videoInput")
const startBtn = document.getElementById("startBtn")
const stopBtn = document.getElementById("stopBtn")
const modelSelect = document.getElementById("modelSelect")
const uploadBtn = document.getElementById("uploadBtn")
const imageUpload = document.getElementById("imageUpload")

// Results elements
const islResult = document.getElementById("islResult")
const emotionResult = document.getElementById("emotionResult")
const ageResult = document.getElementById("ageResult")
const genderResult = document.getElementById("genderResult")
const confidenceResult = document.getElementById("confidenceResult")

let stream = null
let isProcessing = false

// Start camera
startBtn.addEventListener("click", async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    })
    videoInput.srcObject = stream
    startBtn.disabled = true
    stopBtn.disabled = false
    processVideoStream()
  } catch (error) {
    alert("Unable to access camera: " + error.message)
  }
})

// Stop camera
stopBtn.addEventListener("click", () => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
  }
  videoInput.srcObject = null
  startBtn.disabled = false
  stopBtn.disabled = true
  resetResults()
})

// Upload image
uploadBtn.addEventListener("click", () => {
  imageUpload.click()
})

imageUpload.addEventListener("change", (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      sendPrediction(event.target.result)
    }
    reader.readAsDataURL(file)
  }
})

// Process video stream
function processVideoStream() {
  if (videoInput.paused || videoInput.ended) return

  if (!isProcessing && videoInput.readyState === videoInput.HAVE_ENOUGH_DATA) {
    isProcessing = true

    const canvas = document.createElement("canvas")
    canvas.width = videoInput.videoWidth
    canvas.height = videoInput.videoHeight
    const ctx = canvas.getContext("2d")
    ctx.drawImage(videoInput, 0, 0)

    sendPrediction(canvas.toDataURL("image/jpeg"))
  }

  if (stream) {
    setTimeout(processVideoStream, 500) // Process every 500ms
  }
}

// Send prediction to backend
async function sendPrediction(imageData) {
  try {
    const response = await fetch("http://your-backend-url/api/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: imageData,
        model: modelSelect.value,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      updateResults(data)
    }
  } catch (error) {
    console.error("Prediction error:", error)
  } finally {
    isProcessing = false
  }
}

// Update results
function updateResults(data) {
  islResult.textContent = data.sign_language || "-"
  emotionResult.textContent = data.emotion || "-"
  ageResult.textContent = data.age || "-"
  genderResult.textContent = data.gender || "-"
  confidenceResult.textContent = data.confidence ? (data.confidence * 100).toFixed(2) + "%" : "-"
}

// Reset results
function resetResults() {
  islResult.textContent = "-"
  emotionResult.textContent = "-"
  ageResult.textContent = "-"
  genderResult.textContent = "-"
  confidenceResult.textContent = "-"
}
