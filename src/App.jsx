import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import Register from './components/Register';
import Login from './components/Login';
import Courses from './components/Courses';
import CourseDetails from './components/CourseDetails';
import CreateCourse from './components/CreateCourse';
import UpdateCourse from './components/UpdateCourse';
import DeleteCourse from './components/DeleteCourse';
import Assignmnets from './components/Assignments'
import MaterialsPage from './components/MaterialsPage';
import SubmitAssignment from './components/SubmitAssignment';
import CourseChats from './components/CourseChats';
import Meeting from './components/Meeting';
import MeetingRoomPage from './components/MeetingRoomPage';
import Quiz from './components/Quiz';
import Questions from './components/Questions';
import Options from './components/Options';
import QuizRoom from './components/QuizRoom';

function App() {

  const [authToken, setAuthToken] = useState(null)
  const [showRegister, setShowRegister] = useState(true)
  const [courseId, setCourseId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [courseName, setCourseName] = useState('')
  const [admin, setAdmin] = useState('')
  const [adminId, setAdminId] = useState('')
  const [description, setDescription] = useState('')
  const [assignmentId, setAssignmentId] = useState(null)
  const [assignmentText, setAssignmentText] = useState('')
  const [courses, setCourses] = useState([])
  const [meetingId, setMeetingId] = useState(null)
  const [meetingName, setMeetingName] = useState('')
  const [quizTitle, setQuizTitle] = useState('')
  const [quizId, setQuizId] = useState(null)
  const [quesitonId, setQuestionId] = useState(null)
  const [questionText, setQuestionText] = useState('')

  if(!authToken){
    return (
      <div>
        { showRegister ? 
          (<Register setShowRegister={setShowRegister}/>) 
            : 
          (<Login setAuthToken={setAuthToken} setShowRegister={setShowRegister} />)
        }
      </div>
      
    )
  } 

  return (
      <Routes>
        {/* Default route to courses */}
        <Route
          path="/"
          element={<Navigate to="/courses" replace />}
        />

        {/* Routes for the app */}
        <Route
          path="/courses"
          element={
            <Courses
              authToken={authToken}
              setCourseId={setCourseId}
              setCourseName={setCourseName}
              setAdmin={setAdmin}
              setAdminId={setAdminId}
              setDescription={setDescription}
              setAuthToken={setAuthToken}
              courses={courses}
              setCourses={setCourses}
            />
          }
        />
        <Route
          path="/courseDetails"
          element={
            courseId ? (
              <CourseDetails authToken={authToken} courseId={courseId} courseName={courseName} admin={admin} adminId={adminId} description={description} />
            ) : (
              <Navigate to="/courses" replace />
            )
          }
        />
        <Route
          path="/createCourse"
          element={
            <CreateCourse authToken={authToken} setLoading={setLoading} />
          }
        />
        <Route
          path="/updateCourse"
          element={
            <UpdateCourse authToken={authToken} courseId={courseId} courseName={courseName} adminId={adminId} setCourseName={setCourseName} description={description} setDescription={setDescription} setLoading={setLoading} />
          }
        />
        <Route
          path="/deleteCourse"
          element={
            <DeleteCourse authToken={authToken} courseId={courseId} courseName={courseName} />
          }
        />
        <Route
          path="/materials"
          element={
            <MaterialsPage courseId={courseId} authToken={authToken} adminId={adminId} />
          }
        />
        <Route
          path="/assignments"
          element={
            <Assignmnets authToken={authToken} courseId={courseId} courseName={courseName} adminId={adminId} setAssignmentId={setAssignmentId} setAssignmentText={setAssignmentText} />
          }
        />
        <Route
          path="/submitAssignment"
          element={
            <SubmitAssignment authToken={authToken} adminId={adminId} assignmentId={assignmentId} assignmentText={assignmentText} />
          }
        />
        <Route
          path="/courseChats"
          element={
            <CourseChats authToken={authToken} adminId={adminId} courseId={courseId} courseName={courseName} />
          }
        />
        <Route
          path="/meetings"
          element={
            <Meeting authToken={authToken} adminId={adminId} courseId={courseId} courseName={courseName} setMeetingId={setMeetingId} meetingName={meetingName} setMeetingName={setMeetingName} />
          }
        />
        <Route
          path="/meetingRoomPage/:meetingId"
          element={
            <MeetingRoomPage />
          }
        />
        <Route
          path="/quiz"
          element={
            <Quiz authToken={authToken} adminId={adminId} courseId={courseId} courseName={courseName} setQuizId={setQuizId} quizTitle={quizTitle} setQuizTitle={setQuizTitle} />
          }
        />
        <Route
          path="/questions/:quizId"
          element={
            <Questions authToken={authToken} adminId={adminId} quizTitle={quizTitle} quesitonId={quesitonId} setQuestionId={setQuestionId} questionText={questionText} setQuestionText={setQuestionText} />
          }
        />
        <Route
          path="/options/:questionId"
          element={
            <Options authToken={authToken} adminId={adminId} quizId={quizId} questionText={questionText} />
          }
        />
        <Route
          path="/quizRoom/:quizId/:duration"
          element={
            <QuizRoom authToken={authToken} quizTitle={quizTitle} />
          }
        />
      </Routes>
  )
}

export default App
