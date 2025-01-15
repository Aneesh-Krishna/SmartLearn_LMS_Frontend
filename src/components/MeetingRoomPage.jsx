import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { APP_Id, SecreteKey } from '../services/MeetingRoomPageConfig';

function MeetingRoomPage() {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [joined, setJoined] = useState(false);
  const zpRef = useRef(null);
  const containerRef = useRef(null); // Ref for the container element
  const [isRecording, setIsRecording] = useState(false)
  var fullText = "";  // To store the full converted text

  const handleSpeechToText = () => {
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    var recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    
    // var diagnostic = document.getElementById('text');

    if (!isRecording) {
      recognition.start();
      setIsRecording(true);
    } 
    else {
      recognition.stop();
      setIsRecording(false);
      saveTextToPDF();  // Save text to PDF when stopping
    }
    
    recognition.onresult = function (event) {
      var last = event.results.length - 1;
      var convertedText = event.results[last][0].transcript;
      fullText += convertedText + ' ';  // Append to the full text
      // diagnostic.value = convertedText;
      console.log(fullText)
      console.log('Confidence: ' + event.results[0][0].confidence);
    };

    recognition.onnomatch = function () {
        // diagnostic.value = 'I didn\'t recognise that.';
        console.log("I didn't recognize that")
    };

    recognition.onerror = function (event) {
        // diagnostic.value = 'Error occurred in recognition: ' + event.error;
        console.log("Error occured in recognition")
    };
  }

  const saveTextToPDF = () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // Split text into lines to fit into the PDF page size
      const lines = doc.splitTextToSize(fullText, 180);  // Width of 180 to fit into A4 page width
      doc.text(lines, 10, 10);

      // Save the PDF
      doc.save('SpeechToText.pdf');
  }

  useEffect(() => {
    const appId = APP_Id;
    const serverSecrete = SecreteKey;

    // Generate kit token
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appId,
      serverSecrete,
      meetingId,
      `user_${Math.random().toString(36).substr(2, 9)}`, // Unique user ID
      "Your_Name"
    );

    // Initialize ZegoUIKitPrebuilt
    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zpRef.current = zp;

    // Join room
    zp.joinRoom({
      container: containerRef.current, // Use the ref for the container
      sharedLinks: [
        {
          name: 'Personal link',
          url:
            window.location.protocol +
            '//' +
            window.location.host +
            window.location.pathname +
            '?roomID=' +
            meetingId,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.VideoConference,
      },
      maxUsers: 10,
      onJoinRoom: () => {
        setJoined(true);
      },
      onLeaveRoom: () => {
        navigate("/meetings");
      },
    });

    // Cleanup when the component unmounts
    return () => {
      if (zpRef.current) {
        zpRef.current.destroy();
      }
    };
  }, [meetingId, navigate]);

  const handleExit = () => {
    if (zpRef.current) {
      zpRef.current.destroy(); // Cleanup Zego instance
      zpRef.current = null
    }

    navigate("/meetings"); // Navigate back to meetings
  };

  return (
    <div className="room-container">
      <button
      onClick={handleSpeechToText}
      style={{
        position: "absolute",
        top: "10px",
        right: "20px",
        zIndex: 1000,
        padding: "10px 20px",
        backgroundColor: "#ff4d4f",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      Record
    </button>
       <button
        onClick={handleExit}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 1000,
          padding: "10px 20px",
          backgroundColor: "#ff4d4f",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Exit
      </button>
      <div
        ref={containerRef} // Assign the ref to the container
        className="myCallContainer"
        style={{ width: '100vw', height: '100vh' }}
      ></div>
      {/* <textarea id="text" placeholder="Your converted text will appear here..." readonly></textarea> */}
    </div>
  );
}

export default MeetingRoomPage;
