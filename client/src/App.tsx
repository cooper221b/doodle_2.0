import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import DeploymentStatus from './components/DeploymentStatus';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import NewPoll from './pages/NewPoll';
import PollDetail from './pages/PollDetail';
import PublicPoll from './pages/PublicPoll';
import NewBookingPage from './pages/NewBookingPage';
import BookingPageDetail from './pages/BookingPageDetail';
import PublicBooking from './pages/PublicBooking';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <DeploymentStatus />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          <Route path="/polls/new" element={
            <PrivateRoute>
              <NewPoll />
            </PrivateRoute>
          } />

          <Route path="/polls/:id" element={
            <PrivateRoute>
              <PollDetail />
            </PrivateRoute>
          } />

          <Route path="/poll/:publicId" element={<PublicPoll />} />

          <Route path="/booking-pages/new" element={
            <PrivateRoute>
              <NewBookingPage />
            </PrivateRoute>
          } />

          <Route path="/booking-pages/:id" element={
            <PrivateRoute>
              <BookingPageDetail />
            </PrivateRoute>
          } />

          <Route path="/book/:publicId" element={<PublicBooking />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
