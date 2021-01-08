

// DOM elements.
const roomSelectionContainer = document.getElementById('room-selection-container')
const roomInput = document.getElementById('room-input')
const connectButton = document.getElementById('connect-button')

const videoChatContainer = document.getElementById('video-chat-container')
const localVideoComponent = document.getElementById('local-video')
const remoteVideoComponent = document.getElementById('remote-video')

const microphoneList = document.getElementById("microphone-list")
const cameraList = document.getElementById("camera-list")

const createButton = document.getElementById("create-button")
const messageComponent = document.getElementById("message")
const optionOneContainer = document.getElementById("option-one-container")
const optionTwoContainer = document.getElementById("option-two-container")

const muteVideoButton = document.getElementById("mute-video")
const muteAudioButton = document.getElementById("mute-audio")
const driveSaveButton = document.getElementById("drive-save-button")

var driveSuccessAlert = document.getElementById('drive-success-alert');
//document.getElementById('drive-error-alert'); Esta declarado en el file drive.js

var dataUser = document.getElementById('data-user');

// var resultTranscriptContainer = document.getElementById('result-transcript-container');




// Variables.
const socket = io()

let localStream
let remoteStream
let isRoomCreator
let rtcPeerConnection // Connection between the local device and the remote peer.
let roomId

let mediaRecorder
let blobRecordingToStore

// Free public STUN servers provided by Google.
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ],
}

//***************************************************************************** */
//INIT
//***************************************************************************** */
// createButton.addEventListener('click', () => {
//   createRoom()
// })

// connectButton.addEventListener('click', () => {
//   joinRoom(roomInput.value)
// })



// El primero que llegue sera el que la cree y el siguiente se unira
function joinRoom() {
  let room = roomInput.value
  if (room === '') {
    alert('Please type a room ID')
  } else {
    roomId = room
    socket.emit('join', room)
    // showVideoConference()
  }
}



function createRoom() {
  roomId = getRandomInt(100000, 100000000);
  socket.emit('join', roomId)
  // showVideoConference()
}



//***************************************************************************** */
//Crea la reunion
//***************************************************************************** */
// 1
socket.on('room_created', async () => {
  console.log('Socket event callback: room_created')

  await setLocalStream()
  isRoomCreator = true
  showVideoConference()
  transcriptStart()
})

socket.on('start_call', async () => {
  console.log('Socket event callback: start_call')

  if (isRoomCreator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers)
    // Agregar el audio local a rtc
    addLocalTracks(rtcPeerConnection)
    // Si existe un stream lo obtenemos
    rtcPeerConnection.ontrack = setRemoteStream
    rtcPeerConnection.onicecandidate = sendIceCandidate
    await createOffer(rtcPeerConnection)
  }
})
//3
async function createOffer(rtcPeerConnection) {
  let sessionDescription
  try {
    sessionDescription = await rtcPeerConnection.createOffer()
    rtcPeerConnection.setLocalDescription(sessionDescription)
  } catch (error) {
    console.error(error)
  }

  socket.emit('webrtc_offer', {
    type: 'webrtc_offer',
    sdp: sessionDescription,
    roomId,
  })
}

socket.on('webrtc_answer', (event) => {
  console.log('Socket event callback: webrtc_answer')

  rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
})


//***************************************************************************** */
//se une a la reunion
//***************************************************************************** */
// 2
socket.on('room_joined', async () => {
  console.log('Socket event callback: room_joined')

  await setLocalStream()
  socket.emit('start_call', roomId)
  showVideoConference()
  transcriptStart()
})

//4
socket.on('webrtc_offer', async (event) => {
  console.log('Socket event callback: webrtc_offer')

  if (!isRoomCreator) {
    rtcPeerConnection = new RTCPeerConnection(iceServers)
    addLocalTracks(rtcPeerConnection)
    rtcPeerConnection.ontrack = setRemoteStream
    rtcPeerConnection.onicecandidate = sendIceCandidate
    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event))
    await createAnswer(rtcPeerConnection)
  }
})

async function createAnswer(rtcPeerConnection) {
  let sessionDescription
  try {
    sessionDescription = await rtcPeerConnection.createAnswer()
    rtcPeerConnection.setLocalDescription(sessionDescription)
  } catch (error) {
    console.error(error)
  }

  socket.emit('webrtc_answer', {
    type: 'webrtc_answer',
    sdp: sessionDescription,
    roomId,
  })
}

//***************************************************************************** */
// Para el que crea y se une a la llamada
//***************************************************************************** */

async function setLocalStream() {
  let stream
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: microphoneList.value
      },
      video: {
        deviceId: cameraList.value,
        width: 1280,
        height: 720
      },
    })
  } catch (error) {
    console.error('Could not get user media', error)
  }

  localStream = stream
  localVideoComponent.srcObject = stream
  setMediaRecorder(stream)
  // setMediaRecorderDrive(stream)
}


function addLocalTracks(rtcPeerConnection) {
  localStream.getTracks().forEach((track) => {
    rtcPeerConnection.addTrack(track, localStream)
  })
}

function setRemoteStream(event) {
  remoteVideoComponent.srcObject = event.streams[0]
  remoteStream = event.stream
}

function sendIceCandidate(event) {
  if (event.candidate) {
    socket.emit('webrtc_ice_candidate', {
      roomId,
      label: event.candidate.sdpMLineIndex,
      candidate: event.candidate.candidate,
    })
  }
}

socket.on('webrtc_ice_candidate', (event) => {
  console.log('Socket event callback: webrtc_ice_candidate')

  // ICE candidate configuration.
  var candidate = new RTCIceCandidate({
    sdpMLineIndex: event.label,
    candidate: event.candidate,
  })
  rtcPeerConnection.addIceCandidate(candidate)
})


// socket.on("disconnect", () => {
//   if (rtcPeerConnection != null) {
//     rtcPeerConnection.close();
//     delete rtcPeerConnection;
//   }
// });


window.onunload = window.onbeforeunload = () => {
  socket.close();
};

//***************************************************************************** */
// Valida que solo sea una llamara entre 2
//***************************************************************************** */
socket.on('full_room', () => {
  console.log('Socket event callback: full_room')

  alert('The room is full, please try another one')
})



//***************************************************************************** */
// Configuracion
//***************************************************************************** */
function setDevices() {
  navigator
    .mediaDevices
    .enumerateDevices()
    .then(dispositivos => {
      clearDevices();
      dispositivos.forEach((dispositivo, indice) => {
        const $opcion = document.createElement("option");
        $opcion.text = dispositivo.label || `Dispositivo ${indice + 1}`;
        $opcion.value = dispositivo.deviceId;
        if (dispositivo.kind === "audioinput") {
          microphoneList.appendChild($opcion);
        } else if (dispositivo.kind === "videoinput") {
          cameraList.appendChild($opcion);
        }
      })
    })
};
function clearDevices() {
  for (let x = microphoneList.options.length - 1; x >= 0; x--) {
    microphoneList.options.remove(x);
  }
  for (let x = cameraList.options.length - 1; x >= 0; x--) {
    cameraList.options.remove(x);
  }
}
setDevices();

let isAudio = true
function muteAudio() {
  isAudio = !isAudio
  localStream.getAudioTracks()[0].enabled = isAudio
}
muteAudioButton.addEventListener('click', () => {
  muteAudio()
  muteAudioButton.innerHTML = isAudio ? 'Deshabilitar Audio' : 'Habilitar Audio'
})

let isVideo = true
function muteVideo() {
  isVideo = !isVideo
  localStream.getVideoTracks()[0].enabled = isVideo
}
muteVideoButton.addEventListener('click', () => {
  muteVideo()
  muteVideoButton.innerHTML = isVideo ? 'Deshabilitar Video' : 'Habilitar Video'
})

function showVideoConference() {
  roomSelectionContainer.style = 'display: none'
  videoChatContainer.style = 'display: block'
  messageComponent.style = 'display: block'
  optionOneContainer.style = 'display: block'
  messageComponent.innerHTML = `Id de Reunión: ${roomId}`
}


function setMediaRecorder(stream) {
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.start();
  const fragmentos = [];
  mediaRecorder.addEventListener("dataavailable", evento => {
    fragmentos.push(evento.data);
  });
  mediaRecorder.addEventListener("stop", () => {
    blobRecordingToStore = new Blob(fragmentos); //, { type: "video/webm" }
    // Detener el stream
    stream.getTracks().forEach(track => track.stop());
  });
}

// Eventos a partir de que se comienza la reunion
function finallyRoom() {
  if (mediaRecorder)
    mediaRecorder.stop();
  if (rtcPeerConnection != null) {
    rtcPeerConnection.close();
    delete rtcPeerConnection;
  }

  optionTwoContainer.style = 'display: block'
  optionOneContainer.style = 'display: none'
  muteVideo()
  muteAudio()
  transcriptStop();
  socket.emit('leave', roomId)

}

function returnCreateJoin() {
  optionTwoContainer.style = 'display: none'
  optionOneContainer.style = 'display: none'

  roomSelectionContainer.style = 'display: block'
  videoChatContainer.style = 'display: none'
  messageComponent.style = 'display: none'
  messageComponent.innerHTML = ``

  driveSuccessAlert.style.display = 'none';
  driveErrorAlert.style.display = 'none';
}

function donwloadRoom() {
  if (blobRecordingToStore != null) {
    const urlParaDescargar = URL.createObjectURL(blobRecordingToStore);
    let a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = urlParaDescargar;
    a.download = `grabacion-${roomId}-${new Date()}.mp3`; //webm
    a.click();
    window.URL.revokeObjectURL(urlParaDescargar);
  }

}

function saveDrive() {
  if (blobRecordingToStore != null) {
    driveSaveButton.innerHTML = 'Por favor espere, se esta guardando el audio.';
    driveSaveButton.disabled = true;
    // $pMessage.innerHTML = 'Por favor espere, se esta guardando el audio.';
    var file = blobRecordingToStore
    var metadata = { 'name': `grabacion-${roomId}-${new Date()}.mp3` };
    //Se obtiene del archivo drive.js
    var accessToken = gapi.auth.getToken().access_token; // Here gapi is used for retrieving the access token.

    var form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
      method: 'POST',
      headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
      body: form,
    }).then((res) => {
      driveSuccessAlert.style.display = 'block';
      driveSuccessAlert.innerHTML = 'El audio se guardo correctamente.';
      // return res.json();
      driveSaveButton.innerHTML = 'Guardar Reunión en Google Drive';
      driveSaveButton.disabled = false;
    }).catch(error => {
      driveSaveButton.innerHTML = 'Guardar Reunión en Google Drive';
      driveSaveButton.disabled = false;
      driveErrorAlert.style.display = 'block';
      driveErrorAlert.innerHTML = 'Error al guardar el audio. ' + JSON.stringify(error, null, 2)
    });

  }
}

