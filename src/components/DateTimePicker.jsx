import React, { useState, useEffect } from 'react';
import '../styles/DateTimePicker.css';

function DateTimePicker({ value, onChange }) {
    const now = new Date();
    const minDate = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours from now
    const maxDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now

    // Format date to "YYYY-MM-DD HH:mm:ss.0000000"
    const formatDateForAPI = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.0000000`;
    };

    // Parse the initial value if it's in the API format
    const parseInitialValue = (value) => {
        if (!value) return minDate;

        if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{7}$/)) {
            const [datePart, timePart] = value.split(' ');
            const [year, month, day] = datePart.split('-').map(Number);
            const [hours, minutes, seconds] = timePart.split(':').map(part => Number(part.split('.')[0]));
            return new Date(year, month - 1, day, hours, minutes, seconds);
        }

        return new Date(value) || minDate;
    };

    const [date, setDate] = useState(parseInitialValue(value));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    useEffect(() => {
        // Ensure the initial date is within bounds
        if (date < minDate) {
            const newDate = new Date(minDate);
            setDate(newDate);
            onChange(formatDateForAPI(newDate));
        } else if (date > maxDate) {
            const newDate = new Date(maxDate);
            setDate(newDate);
            onChange(formatDateForAPI(newDate));
        }
    }, []);

    const isDateDisabled = (dayDate) => {
        // Disable dates before minDate (3 hours from now)
        if (dayDate < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) {
            return true;
        }

        // Disable dates after maxDate (3 days from now)
        if (dayDate > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) {
            return true;
        }

        return false;
    };

    const handleDateChange = (newDate) => {
        const updatedDate = new Date(date);
        updatedDate.setFullYear(newDate.getFullYear());
        updatedDate.setMonth(newDate.getMonth());
        updatedDate.setDate(newDate.getDate());

        // If selecting today, ensure time is at least 3 hours from now
        const isToday = (
            updatedDate.getDate() === now.getDate() &&
            updatedDate.getMonth() === now.getMonth() &&
            updatedDate.getFullYear() === now.getFullYear()
        );

        if (isToday) {
            if (updatedDate < minDate) {
                updatedDate.setTime(minDate.getTime());
            }
        }

        setDate(updatedDate);
        onChange(formatDateForAPI(updatedDate));
        setShowDatePicker(false);
    };

    const handleTimeChange = (hours, minutes) => {
        const updatedDate = new Date(date);
        updatedDate.setHours(hours);
        updatedDate.setMinutes(minutes);

        // Ensure time is within allowed range
        if (updatedDate < minDate) {
            updatedDate.setTime(minDate.getTime());
        } else if (updatedDate > maxDate) {
            updatedDate.setTime(maxDate.getTime());
        }

        setDate(updatedDate);
        onChange(formatDateForAPI(updatedDate));
        setShowTimePicker(false);
    };

    const formatAMPM = (date) => {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minutes} ${ampm}`;
    };

    const getMinHours = () => {
        const isMinDate = (
            date.getDate() === minDate.getDate() &&
            date.getMonth() === minDate.getMonth() &&
            date.getFullYear() === minDate.getFullYear()
        );
        return isMinDate ? minDate.getHours() : 0;
    };

    const getMaxHours = () => {
        const isMaxDate = (
            date.getDate() === maxDate.getDate() &&
            date.getMonth() === maxDate.getMonth() &&
            date.getFullYear() === maxDate.getFullYear()
        );
        return isMaxDate ? maxDate.getHours() : 23;
    };

    const getMinMinutes = (hours) => {
        const isMinDate = (
            date.getDate() === minDate.getDate() &&
            date.getMonth() === minDate.getMonth() &&
            date.getFullYear() === minDate.getFullYear() &&
            hours === minDate.getHours()
        );
        return isMinDate ? minDate.getMinutes() : 0;
    };

    const getMaxMinutes = (hours) => {
        const isMaxDate = (
            date.getDate() === maxDate.getDate() &&
            date.getMonth() === maxDate.getMonth() &&
            date.getFullYear() === maxDate.getFullYear() &&
            hours === maxDate.getHours()
        );
        return isMaxDate ? maxDate.getMinutes() : 55;
    };

    return (
        <div className="gc-datetime-picker">
            <div className="gc-datetime-display">
                <button
                    type="button"
                    className="gc-date-button"
                    onClick={() => {
                        setShowDatePicker(!showDatePicker);
                        setShowTimePicker(false);
                    }}
                >
                    <span className="material-icons">calendar_today</span>
                    {`${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`}
                </button>
                <button
                    type="button"
                    className="gc-time-button"
                    onClick={() => {
                        setShowTimePicker(!showTimePicker);
                        setShowDatePicker(false);
                    }}
                >
                    <span className="material-icons">access_time</span>
                    {formatAMPM(date)}
                </button>
            </div>

            {showDatePicker && (
                <div className="gc-date-picker">
                    <div className="gc-date-picker-header">
                        <button
                            type="button"
                            className="gc-nav-button"
                            onClick={() => {
                                const newDate = new Date(date);
                                newDate.setMonth(newDate.getMonth() - 1);
                                setDate(newDate);
                            }}
                            disabled={date <= minDate}
                        >
                            <span className="material-icons">chevron_left</span>
                        </button>
                        <div className="gc-month-year">
                            {months[date.getMonth()]} {date.getFullYear()}
                        </div>
                        <button
                            type="button"
                            className="gc-nav-button"
                            onClick={() => {
                                const newDate = new Date(date);
                                newDate.setMonth(newDate.getMonth() + 1);
                                setDate(newDate);
                            }}
                            disabled={date >= maxDate}
                        >
                            <span className="material-icons">chevron_right</span>
                        </button>
                    </div>
                    <div className="gc-days-header">
                        {days.map(day => (
                            <div key={day} className="gc-day-header">{day}</div>
                        ))}
                    </div>
                    <div className="gc-days-grid">
                        {Array.from({ length: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() }, (_, i) => {
                            const day = i + 1;
                            const dayDate = new Date(date.getFullYear(), date.getMonth(), day);
                            const isCurrentMonth = dayDate.getMonth() === date.getMonth();
                            const isSelected = date.getDate() === day && isCurrentMonth;
                            const isDisabled = isDateDisabled(dayDate) || !isCurrentMonth;

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    className={`gc-day-button ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                                    onClick={() => !isDisabled && handleDateChange(new Date(date.getFullYear(), date.getMonth(), day))}
                                    disabled={isDisabled}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {showTimePicker && (
                <div className="gc-time-picker">
                    <div className="gc-time-sliders">
                        <div className="gc-time-slider">
                            <label>Hour</label>
                            <input
                                type="range"
                                min={getMinHours()}
                                max={getMaxHours()}
                                value={date.getHours()}
                                onChange={(e) => {
                                    const newDate = new Date(date);
                                    newDate.setHours(parseInt(e.target.value));
                                    setDate(newDate);
                                    onChange(formatDateForAPI(newDate));
                                }}
                            />
                            <span>{date.getHours() % 12 || 12}</span>
                        </div>
                        <div className="gc-time-slider">
                            <label>Minute</label>
                            <input
                                type="range"
                                min={getMinMinutes(date.getHours())}
                                max={getMaxMinutes(date.getHours())}
                                step="5"
                                value={date.getMinutes()}
                                onChange={(e) => {
                                    const newDate = new Date(date);
                                    newDate.setMinutes(parseInt(e.target.value));
                                    setDate(newDate);
                                    onChange(formatDateForAPI(newDate));
                                }}
                            />
                            <span>{date.getMinutes().toString().padStart(2, '0')}</span>
                        </div>
                    </div>
                    <div className="gc-ampm-toggle">
                        <button
                            type="button"
                            className={date.getHours() < 12 ? 'active' : ''}
                            onClick={() => {
                                const newDate = new Date(date);
                                if (newDate.getHours() >= 12) {
                                    newDate.setHours(newDate.getHours() - 12);
                                    setDate(newDate);
                                    onChange(formatDateForAPI(newDate));
                                }
                            }}
                            disabled={date.getHours() < 12 && date <= minDate}
                        >
                            AM
                        </button>
                        <button
                            type="button"
                            className={date.getHours() >= 12 ? 'active' : ''}
                            onClick={() => {
                                const newDate = new Date(date);
                                if (newDate.getHours() < 12) {
                                    newDate.setHours(newDate.getHours() + 12);
                                    setDate(newDate);
                                    onChange(formatDateForAPI(newDate));
                                }
                            }}
                            disabled={date.getHours() >= 12 && date >= maxDate}
                        >
                            PM
                        </button>
                    </div>
                    <div className="gc-time-info">
                        Select time between {formatAMPM(minDate)} and {formatAMPM(maxDate)}
                    </div>
                </div>
            )}
        </div>
    );
}

export default DateTimePicker;