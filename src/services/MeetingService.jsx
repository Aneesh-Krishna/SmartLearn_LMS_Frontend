
import { jwtDecode } from "jwt-decode";

const BASE_URL = "https://localhost:7110/api/meeting";

export const fetchAllMeetings = async (courseId, authToken) => {
    try{
        const response = await fetch(`${BASE_URL}/${courseId}/getMeetings`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${authToken}`,
            }
        });

        if(response.ok){
            return response.json()
        }
        else{
            console.error("An error occured while fetching the meetings: ", response.statusText);
        }
    }
    catch(error){
        console.error("Something went wrong...", error);
    }
}

export const fetchAllParticipants = async (meetingId, authToken) => {
    try{
        const response = await fetch(`${BASE_URL}/${meetingId}/getParticipants`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${authToken}`,
            }
        });

        if(response.ok){
            return response.json()
        }
        else{
            console.error("An error occured while fetching the participants: ", response.statusText);
        }
    }
    catch(error){
        console.error("Something went wrong...", error);
    }
}

export const createMeeting = async (courseId, authToken, meetingName) => {
    try{
        // console.log("MeetingService: ", meetingName)
        const form = new FormData()
        form.append('meetingName', meetingName)
        const response = await fetch(`${BASE_URL}/${courseId}/createMeeting`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
            body: form,
        });

        if(response.ok){
            return response.json();
        }
        else{
            console.error("An error occured while creating the meeting: ", response.statusText);
        }
    }
    catch(error){
        console.error("Something went wrong...", error)
    }
}

export const leaveMeeting = async (meetingId, authToken) => {
    try{
        const decodedToken = jwtDecode(authToken);
        const form = new FormData()
        form.append('participantId', decodedToken.sub)

        const response = await fetch(`${BASE_URL}/${meetingId}/leaveMeeting`, {
            method: "PUT",
            headers:  {
                Authorization: `Bearer ${authToken}`,
            },
            body: form,
        });

        if(response.ok){
            return response.json()
        }
        else{
            throw new error("An error occured while leaving the meeting: ", response.statusText)
        }
    }
    catch(error){
        console.error("Something went wrong...", error)
    }
}

export const endMeeting = async (meetingId, authToken) => {
    try{
        const response = await fetch(`${BASE_URL}/${meetingId}/EndMeeting`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${authToken}`,
            }
        });

        if(response.ok){
            return response.json()
        }
        else{
            console.error("An error occured while ending the meeting: ", response.statusText)
        }
    }
    catch(error){
        console.error("Something went wrong...", error)
    }
}