import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Map, Search, LogOut, LogIn, Settings, Briefcase, User as UserIcon, Heart, UserPlus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { AuthAPI } from '../api/client';
import { useNotification } from '../context/NotificationContext';
import { parseBackendError } from '../api/errorHandler';

export default function Navbar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { favorites } = useFavorites();
  const { showToast, openConfirm } = useNotification();
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) navigate(`/?search=${encodeURIComponent(searchValue)}`);
    else navigate('/');
  };

  const handleDeleteAccount = () => {
    openConfirm(
      "Видалити акаунт?",
      "Ви впевнені, що хочете назавжди видалити свій акаунт? Цю дію неможливо скасувати!",
      async () => {
        try {
          await AuthAPI.deleteMe();
          logout();
          navigate('/');
          showToast('Ваш акаунт було успішно видалено', 'success');
        } catch (error: any) {
          showToast(parseBackendError(error), 'error');
        }
      }
    );
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        <Link to="/" className="text-2xl font-bold tracking-wide flex items-center gap-2">
          <Map size={28} /><span>Турагенція</span>
        </Link>

        <form onSubmit={handleSearch} className="w-full md:w-1/3 flex relative text-gray-800 group">
          <input
            type="text" placeholder="Куди хочете поїхати?"
            className="w-full py-2 pl-5 pr-12 rounded-full bg-white/95 border-2 border-transparent focus:bg-white focus:outline-none focus:border-blue-200 shadow-sm transition-all"
            value={searchValue} onChange={(e) => setSearchValue(e.target.value)}
          />
          <button type="submit" className="absolute right-1.5 top-1 bottom-1 px-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center">
            <Search size={16} strokeWidth={3} />
          </button>
        </form>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/favorites" className="relative flex items-center gap-1 hover:text-blue-200 transition-colors">
                <Heart size={20} /><span className="hidden md:inline">Улюблені</span>
                {favorites.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {favorites.length}
                  </span>
                )}
              </Link>

              <Link to="/bookings" className="flex items-center gap-1 hover:text-blue-200">
                <Briefcase size={18} /> Бронювання
              </Link>

              {(user.role === 'Admin' || user.role === 'Manager') && (
                <Link to="/admin" className="flex items-center gap-1 hover:text-blue-200">
                  <Settings size={18} /> Панель
                </Link>
              )}

              <div 
                className="relative ml-4 pl-4 border-l border-blue-400"
                onMouseEnter={() => setIsMenuOpen(true)} 
                onMouseLeave={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center gap-2 cursor-pointer py-1">
                  <UserIcon size={18} />
                  <span className="text-sm font-medium">{user.email.split('@')[0]}</span>
                </div>
                
                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-0 w-48 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden text-gray-800 flex flex-col py-1">
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors">
                      <LogOut size={16} className="text-gray-500" /> Вийти
                    </button>
                    <button onClick={handleDeleteAccount} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100 transition-colors">
                      <Trash2 size={16} /> Видалити акаунт
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="flex items-center gap-1 bg-transparent text-white px-3 py-1.5 rounded-full font-bold hover:bg-blue-700 transition-colors">
                <LogIn size={18} /> Вхід
              </Link>
              <Link to="/register" className="flex items-center gap-1 bg-white text-blue-600 px-4 py-1.5 rounded-full font-bold hover:bg-gray-100 shadow-sm transition-colors">
                <UserPlus size={18} /> Реєстрація
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}