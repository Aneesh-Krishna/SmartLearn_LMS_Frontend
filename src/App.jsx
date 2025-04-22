import { useState } from 'react'
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
  const handleSort = (criteria) => {
    setSortBy(criteria);
  };

  document.title = "SmartLearn_LMS"

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
      <Navigation setAuthToken={setAuthToken} onSort={handleSort} />
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
                  setAuthToken={setAuthToken}
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
                setAuthToken={setAuthToken}
                setLoading={setLoading}
              />
            }
          />
          <Route
            path="/updateCourse"
            element={
              <UpdateCourse
                authToken={authToken}
                setAuthToken={setAuthToken}
                courseId={courseId}
                courseName={courseName}
                adminId={adminId}
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
                setAuthToken={setAuthToken}
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
                setAuthToken={setAuthToken}
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

        </Routes>
      </main>
    </>
  )
}

export default App