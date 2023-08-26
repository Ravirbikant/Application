import React, { useState, useRef } from "react";
import Webcam from "react-webcam";

function App() {
  const stream = useRef(null);
  const [recorder, setRecorder] = useState(null);
  const videoRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [showWebCam, setShowWebCam] = useState(true);
  const [mute, setMute] = useState(false);
  const [cameraControl, setCameraControl] = useState("Turn off Camera");
  const [audioControl, setAudioControl] = useState("Mute");
  const [stopButtonState, setStopButtonState] = useState(true);
  const [toggleCameraState, setToggleCameraState] = useState(true);
  const [toggleMicState, setToggleMicState] = useState(true);
  const [startButtonState, setStartButtonState] = useState(false);
  const [showRecording, setShowRecording] = useState(false);

  const startRecording = async () => {
    setStartButtonState(true);
    setStopButtonState(false);
    setToggleCameraState(false);
    setToggleMicState(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      stream.current = mediaStream;

      const mediaRecorder = new MediaRecorder(stream.current);
      setRecorder(mediaRecorder);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const recordedBlob = new Blob(recordedChunksRef.current, {
          type: "video/webm",
        });
        videoRef.current.src = URL.createObjectURL(recordedBlob);

        function uploadBlob() {
          fetch("URL", {
            method: "POST",
            body: recordedBlob,
          })
            .then((response) =>
              alert(response.status + " : " + response.statusText)
            )
            .catch((err) => alert(err));
        }

        uploadBlob();
      };

      mediaRecorder.start();
    } catch (error) {
      alert("Error accessing camera or microphone:", error);
    }
  };

  const toggleCamera = () => {
    if (showWebCam) {
      setShowWebCam(false);
      stream.current.getTracks()[1].enabled = false;
      setCameraControl("Turn On Camera");
    } else {
      setShowWebCam(true);
      stream.current.getTracks()[1].enabled = true;
      setCameraControl("Turn off Camera");
    }
  };

  const toggleAudio = () => {
    if (mute) {
      setMute(false);
      stream.current.getTracks()[0].enabled = true;
      setAudioControl("Mute");
    } else {
      setMute(true);
      stream.current.getTracks()[0].enabled = false;
      setAudioControl("UnMute");
    }
  };

  const stopRecording = () => {
    if (recorder) {
      recorder.stop();
      stream.current.getTracks().forEach((track) => track.stop());
      setStartButtonState(false);
      console.log("Disabled : " + startButtonState);
      setShowRecording(true);
      setStopButtonState(true);
      setToggleCameraState(true);
      setToggleMicState(true);
    }
  };

  return (
    <div className="container">
      {showWebCam && (
        <Webcam
          style={{ height: "100vh", width: "100vw", zIndex: "-1" }}
          mirrored
        />
      )}

      <div className="buttons-container">
        <button id="start" onClick={startRecording} disabled={startButtonState}>
          🔴
        </button>
        <button onClick={toggleCamera} disabled={toggleCameraState}>
          {cameraControl}
        </button>
        <button onClick={toggleAudio} disabled={toggleMicState}>
          {audioControl}
        </button>
        <button id="stop" onClick={stopRecording} disabled={stopButtonState}>
          ⬛
        </button>
      </div>

      {showRecording && (
        <video ref={videoRef} controls style={{ marginTop: "20px" }} />
      )}
    </div>
  );
}

export default App;
