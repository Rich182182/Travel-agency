import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ToursListPage from './pages/ToursListPage';
import TourDetailsPage from './pages/TourDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPanelPage from './pages/AdminPanelPage';
import MyBookingsPage from './pages/MyBookingsPage';
import FavoritesPage from './pages/FavoritesPage';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext'; 

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gray-50 font-sans">
            <Navbar />
            <Routes>
              <Route path="/" element={<ToursListPage />} />
              <Route path="/tour/:id" element={<TourDetailsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin" element={<AdminPanelPage />} />
              <Route path="/bookings" element={<MyBookingsPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
            </Routes>
          </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}