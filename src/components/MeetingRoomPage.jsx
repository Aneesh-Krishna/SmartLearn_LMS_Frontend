import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { APP_Id, SecreteKey } from '../services/MeetingRoomPageConfig';
import axios from 'axios';
import jsPDF from 'jspdf';

function MeetingRoomPage() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const zpRef = useRef(null);
  const containerRef = useRef(null);
  const videoRefs = useRef({});
  const canvasRefs = useRef({});
  const audioRefs = useRef({});
  const [participants, setParticipants] = useState([]);
  const [captionText, setCaptionText] = useState("");
  const [transcribing, setTranscribing] = useState(false);
  let fullText = "";
  const [emotionReports, setEmotionReports] = useState([]);

  // Function to capture video frames for emotion analysis
  // const captureVideoFrames = (userID, displayName) => {
  //   const video = videoRefs.current[userID];
  //   const canvas = canvasRefs.current[userID];
  //   if (video && canvas) {
  //     const ctx = canvas.getContext("2d");
  //     canvas.width = video.videoWidth;
  //     canvas.height = video.videoHeight;
  //     setInterval(() => {
  //       ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  //       const imageData = canvas.toDataURL("image/png");
  //       console.log(`Captured frame for ${displayName} (${userID}):`, imageData);

  //       setEmotionReports(prevReports => [
  //         ...prevReports.filter(r => r.userID !== userID),
  //         { userID, displayName, imageData, timestamp: new Date().toISOString() }
  //       ]);
  //     }, 1000);
  //   }
  // };

  const captureVideoFrames = (userID, displayName) => {
    const video = videoRefs.current[userID];
    const canvas = canvasRefs.current[userID];
    if (video && canvas) {
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      setInterval(async () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/png"); // Convert to Base64

        try {
          const response = await axios.post("http://localhost:8000/analyze_video", {
            userID,
            displayName,
            imageData,
          });

          console.log(`Emotion Analysis for ${displayName}:`, response.data);
          setEmotionReports(prevReports => [
            ...prevReports.filter(r => r.userID !== userID),
            { userID, displayName, emotion: response.data.emotion, timestamp: new Date().toISOString() }
          ]);
        } catch (error) {
          console.error("Error analyzing video:", error);
        }
      }, 3000); // Process every 3 seconds
    }
  };

  // Function to capture audio for sentiment analysis
  // const captureAudio = async (stream, userID, displayName) => {
  //   const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  //   const source = audioContext.createMediaStreamSource(stream);
  //   const analyser = audioContext.createAnalyser();
  //   source.connect(analyser);
  //   const dataArray = new Uint8Array(analyser.frequencyBinCount);
  //   setInterval(() => {
  //     analyser.getByteFrequencyData(dataArray);
  //     console.log(`Audio frequency data for ${displayName} (${userID}):`, dataArray);
  //   }, 1000);
  // };

  const captureAudio = async (stream, userID, displayName) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const mediaRecorder = new MediaRecorder(stream);
    let audioChunks = [];

    mediaRecorder.ondataavailable = event => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
      const formData = new FormData();
      formData.append("file", audioBlob);
      formData.append("userID", userID);
      formData.append("displayName", displayName);

      try {
        const response = await axios.post("http://localhost:8000/analyze_audio", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        console.log(`Audio Sentiment for ${displayName}:`, response.data);
      } catch (error) {
        console.error("Error analyzing audio:", error);
      }

      audioChunks = [];
    };

    setInterval(() => {
      mediaRecorder.stop();
      mediaRecorder.start();
    }, 5000); // Capture every 5 seconds

    mediaRecorder.start();
  };


  // Function for real-time speech-to-text transcription
  const handleSpeechToText = () => {
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    var recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    setTranscribing(!transcribing);
    if (!transcribing) {
      recognition.start();
    } else {
      recognition.stop();
      setCaptionText("");
    }

    recognition.onresult = function (event) {
      var last = event.results.length - 1;
      var convertedText = event.results[last][0].transcript;
      setCaptionText(convertedText);
      fullText += convertedText + ' ';
      console.log(fullText);
    };

    recognition.onerror = function (event) {
      console.log("Error occurred in recognition", event.error);
    };
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Meeting Sentiment Analysis Report", 10, 10);

    let yOffset = 20;

    // Append Emotion Analysis
    doc.text("Video Sentiment Analysis:", 10, yOffset);
    yOffset += 10;

    emotionReports.forEach((report, index) => {
      doc.text(
        `${index + 1}. ${report.displayName} (${report.timestamp}): ${report.emotion}`,
        10,
        yOffset
      );
      yOffset += 10;
    });

    // Append Speech Transcription
    doc.text("Speech Transcription:", 10, yOffset);
    yOffset += 10;
    doc.text(fullText || "No speech recorded.", 10, yOffset, { maxWidth: 180 });

    // Save the PDF
    doc.save(`Meeting_Report_${new Date().toISOString()}.pdf`);
  };

  useEffect(() => {
    const appId = APP_Id;
    const serverSecrete = SecreteKey;

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appId,
      serverSecrete,
      meetingId,
      `user_${Math.random().toString(36).substr(2, 9)}`,
      "Your_Name"
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zpRef.current = zp;

    zp.joinRoom({
      container: containerRef.current,
      scenario: { mode: ZegoUIKitPrebuilt.VideoConference },
      maxUsers: 10,
      onJoinRoom: () => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
          const localUserID = "local_user";
          videoRefs.current[localUserID] = document.createElement("video");
          canvasRefs.current[localUserID] = document.createElement("canvas");
          videoRefs.current[localUserID].srcObject = stream;
          videoRefs.current[localUserID].play();
          captureVideoFrames(localUserID, "You");
          captureAudio(stream, localUserID, "You");
        });
      },
      onRemoteUserUpdate: (updateType, users) => {
        if (updateType === "ADD") {
          setParticipants(prev => [...prev, ...users]);
          users.forEach(user => {
            zpRef.current.getRemoteVideoStream(user.userID).then(stream => {
              videoRefs.current[user.userID] = document.createElement("video");
              canvasRefs.current[user.userID] = document.createElement("canvas");
              videoRefs.current[user.userID].srcObject = stream;
              videoRefs.current[user.userID].play();
              captureVideoFrames(user.userID, user.userName);
              captureAudio(stream, user.userID, user.userName);
            });
          });
        } else if (updateType === "DELETE") {
          setParticipants(prev => prev.filter(p => !users.some(u => u.userID === p.userID)));
        }
      },
      onLeaveRoom: () => {
        generatePDF();
        if (zpRef.current) {
          zpRef.current.destroy();
        }
        navigate("/meetings");
      },
    });

    return () => {
      if (zpRef.current) {
        zpRef.current.destroy();
      }
    };
  }, [meetingId, navigate]);

  return (
    <div className="room-container">
      <button onClick={handleSpeechToText} className="record-btn">{transcribing ? "Stop" : "Record"}</button>
      <button onClick={() => navigate("/meetings")} className="exit-btn">Exit</button>
      <div ref={containerRef} className="myCallContainer" style={{ width: '100vw', height: '100vh' }}></div>
      {transcribing && (
        <div className="caption-text"
          style={{
            position: "absolute",
            bottom: "30px", // Display captions at bottom
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            color: "#fff",
            padding: "10px",
            borderRadius: "5px",
            fontSize: "18px",
            maxWidth: "80%",
            textAlign: "center",
            zIndex: 1000,
          }}
        >
          {captionText || "Transcribed text will appear here..."}
        </div>
      )}
    </div>
  );
}

export default MeetingRoomPage;
