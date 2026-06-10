import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ToursListPage from './pages/ToursListPage';
import TourDetailsPage from './pages/TourDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; // Новий імпорт
import AdminPanelPage from './pages/AdminPanelPage';
import MyBookingsPage from './pages/MyBookingsPage';
import FavoritesPage from './pages/FavoritesPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-grow p-4 md:p-0">
            <Routes>
              <Route path="/" element={<ToursListPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/tour/:id" element={<TourDetailsPage />} />
              <Route path="/admin" element={<AdminPanelPage />} />
              <Route path="/bookings" element={<MyBookingsPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;