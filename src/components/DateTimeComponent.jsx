import React, { useState } from 'react';
import '../styles/DateTimeComponent.css';

export default function DateTimeComponent({ onChange }) {
  const formatDateTimeLocal = (date) => {
    const pad = (n) => n.toString().padStart(2, '0');
    return (
      date.getFullYear() +
      '-' +
      pad(date.getMonth() + 1) +
      '-' +
      pad(date.getDate()) +
      'T' +
      pad(date.getHours()) +
      ':' +
      pad(date.getMinutes())
    );
  };

  const now = new Date();
  const threeHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

  const minTime = formatDateTimeLocal(threeHoursLater);
  const maxTime = formatDateTimeLocal(twoDaysLater);

  const [selectedDateTime, setSelectedDateTime] = useState(minTime);
  const [error, setError] = useState('');

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    setSelectedDateTime(e.target.value);

    if (selectedDate < threeHoursLater) {
      setError('Selected time must be at least 3 hours from now.');
    } else {
      setError('');
      if (onChange) {
        onChange(e.target.value);
      }
    }
  };

  return (
    <>
      <label htmlFor="meeting-time">
        Choose a time for your quiz:
      </label>
      <input
        type="datetime-local"
        id="meeting-time"
        name="meeting-time"
        min={minTime}
        max={maxTime}
        value={selectedDateTime}
        onChange={handleDateChange}
      />
      {error && <p className="error-message">{error}</p>}
    </>
  );
}