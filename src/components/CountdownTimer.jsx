// src/CountdownTimer.js
import React, { useState, useEffect } from 'react';
import '../styles/CountdownTimer.css'; // Importing the CSS file

const CountdownTimer = ({ initialMinutes = 0, initialSeconds = 0 }) => {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(timer);
        } else {
          setMinutes(minutes - 1);
          setSeconds(59);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [minutes, seconds]);

  return (
    <div className="countdown-timer">
      <h5>
        Time remaining: <span className="timer-text">{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>
      </h5>
    </div>
  );
};

export default CountdownTimer;