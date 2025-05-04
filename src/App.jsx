import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, } from 'react-router-dom';
import './App.css'
import './styles/Navigation.css'
import Navigation from './components/Navigation.jsx';
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
import LibraryMaterials from './components/LibraryMaterials';
import DocumentAnalysisBot from './components/DocumentAnalysisBot.jsx';
import Meeting from './components/Meeting.jsx';
import SettingsPage from './components/SettingsPage.jsx';
import { jwtDecode } from 'jwt-decode';
import Quiz from './components/Quiz.jsx';
import QuizRoom from './components/QuizRoom.jsx';
import Questions from './components/Questions.jsx';
import Options from './components/Options.jsx';

function App() {
  const [authToken, setAuthToken] = useState(() => {
    return localStorage.getItem('authToken') || null;
  })
  const [showRegister, setShowRegister] = useState(true)
  const [courseId, setCourseId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [courseName, setCourseName] = useState('')
  const [admin, setAdmin] = useState('')
  const [adminId, setAdminId] = useState('')
  const [description, setDescription] = useState('')
  const [assignmentId, setAssignmentId] = useState(null)
  const [assignmentText, setAssignmentText] = useState('')
  const [sortBy, setSortBy] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [isLogout, setIsLogout] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizId, setQuizId] = useState(null);
  const [quesitonId, setQuestionId] = useState(null);
  const [questionText, setQuestionText] = useState('');

  const handleSort = (criteria) => {
    setSortBy(criteria);
  };

  var paramUserName;
  var paramUserEmail;

  document.title = "SmartLearn_LMS";

  const getUserName = async () => {
    try {
      const userId = jwtDecode(authToken).sub;
      const response = await fetch(`http://localhost:5116/api/account/${userId}/details`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();

        setUserName(data?.$values[0]?.userName);
        setUserEmail(data?.$values[0]?.email);

        paramUserName = data?.$values[0]?.userName;
        paramUserEmail = data?.$values[0]?.email;

        console.log(paramUserName);
        console.log(paramUserEmail);

      }
      else {
        setUserName(null);
        setUserEmail(null);
      }
    }
    catch (error) {
      console.error("Something went wrong while fetching the user's details...", error);
    }
  }

  useEffect(() => {
    getUserName();
  }, [authToken]);

  if (!authToken) {
    return (
      <div>
        {showRegister ?
          (<Register setShowRegister={setShowRegister} />)
          :
          (<Login setAuthToken={setAuthToken} setShowRegister={setShowRegister} />)
        }
      </div>
    )
  }

  return (
    <>
      <Navigation authToken={authToken} setAuthToken={setAuthToken} onSort={handleSort} userName={userName} userEmail={userEmail} setIsLogout={setIsLogout} />
      <main className="app-main">
        <Routes>
          {/* Default route to courses */}
          <Route
            path="/"
            element={<Navigate to="/home" replace />}


          />

          {/* Routes for the app */}
          <Route
            path="/home"
            element={
              <Courses
                authToken={authToken}
                setAuthToken={setAuthToken}
                setCourseId={setCourseId}
                setCourseName={setCourseName}
                setAdmin={setAdmin}
                setAdminId={setAdminId}
                setDescription={setDescription}
                sortBy={sortBy}
              />
            }
          />
          <Route
            path="/courses"
            element={
              <Courses
                authToken={authToken}
                setAuthToken={setAuthToken}
                setCourseId={setCourseId}
                setCourseName={setCourseName}
                setAdmin={setAdmin}
                setAdminId={setAdminId}
                setDescription={setDescription}
                sortBy={sortBy}
              />
            }
          />
          <Route
            path="/courseDetails"
            element={
              courseId ? (
                <CourseDetails
                  authToken={authToken}
                  courseId={courseId}
                  courseName={courseName}
                  admin={admin}
                  adminId={adminId}
                  description={description}
                />
              ) : (
                <Navigate to="/courses" replace />
              )
            }
          />
          <Route
            path="/createCourse"
            element={
              <CreateCourse
                authToken={authToken}
                setLoading={setLoading}
              />
            }
          />
          <Route
            path="/updateCourse"
            element={
              <UpdateCourse
                authToken={authToken}
                courseId={courseId}
                courseName={courseName}
                adminId={adminId}
                admin={admin}
                setCourseName={setCourseName}
                description={description}
                setDescription={setDescription}
                setLoading={setLoading}
              />
            }
          />
          <Route
            path="/deleteCourse"
            element={
              <DeleteCourse
                authToken={authToken}
                courseId={courseId}
                courseName={courseName}
              />
            }
          />
          <Route
            path="/materials"
            element={
              <MaterialsPage
                courseId={courseId}
                authToken={authToken}
                adminId={adminId}
              />
            }
          />
          <Route
            path="/assignments"
            element={
              <Assignmnets
                authToken={authToken}
                courseId={courseId}
                courseName={courseName}
                adminId={adminId}
                admin={admin}
                setAssignmentId={setAssignmentId}
                setAssignmentText={setAssignmentText}
              />
            }
          />
          <Route
            path="/submitAssignment"
            element={
              <SubmitAssignment
                authToken={authToken}
                adminId={adminId}
                admin={admin}
                assignmentId={assignmentId}
                assignmentText={assignmentText}
              />
            }
          />
          <Route
            path="/courseChats"
            element={
              <CourseChats
                authToken={authToken}
                adminId={adminId}
                admin={admin}
                courseId={courseId}
                courseName={courseName}
              />
            }
          />
          <Route
            path="/library"
            element={
              <LibraryMaterials
                authToken={authToken}
              />
            }
          />
          <Route
            path="/documentAnalysis"
            element={
              <DocumentAnalysisBot />
            }
          />
          <Route
            path="/meetings"
            element={
              <Meeting
                authToken={authToken}
                adminId={adminId}
                courseId={courseId}
                courseName={courseName}
              />
            }
          />
          <Route
            path="/settings"
            element={
              <SettingsPage
                authToken={authToken}
              />
            }
          />
          <Route
            path="/quiz"
            element={
              <Quiz
                authToken={authToken}
                adminId={adminId}
                admin={admin}
                courseId={courseId}
                courseName={courseName}
                setQuizId={setQuizId}
                quizTitle={quizTitle}
                setQuizTitle={setQuizTitle}
              />
            }
          />
          <Route
            path="/questions/:quizId/:hasEnded"
            element={
              <Questions
                authToken={authToken}
                adminId={adminId}
                admin={admin}
                quizTitle={quizTitle}
                quesitonId={quesitonId}
                setQuestionId={setQuestionId}
                questionText={questionText}
                setQuestionText={setQuestionText}
              />
            }
          />
          <Route
            path="/options/:questionId/:hasEnded"
            element={
              <Options
                authToken={authToken}
                adminId={adminId}
                admin={admin}
                quizId={quizId}
                questionText={questionText}
              />
            }
          />
          <Route
            path="/quizRoom/:quizId/:duration"
            element={
              <QuizRoom
                authToken={authToken}
                quizTitle={quizTitle}
              />
            }
          />

        </Routes>
      </main>
    </>
  )
}

export default App