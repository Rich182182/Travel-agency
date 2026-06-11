import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Map, Search, LogOut, LogIn, Settings, Briefcase, User as UserIcon, Heart, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../hooks/useFavorites';

export default function Navbar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { favorites } = useFavorites();
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) navigate(`/?search=${encodeURIComponent(searchValue)}`);
    else navigate('/');
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        <Link to="/" className="text-2xl font-bold tracking-wide flex items-center gap-2">
          <Map size={28} /><span>Турагенція</span>
        </Link>

        <form onSubmit={handleSearch} className="w-full md:w-1/3 flex relative text-gray-800">
          <input
            type="text" placeholder="Куди хочете поїхати?"
            className="w-full p-2 pl-4 pr-10 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
            value={searchValue} onChange={(e) => setSearchValue(e.target.value)}
          />
          <button type="submit" className="absolute right-2 top-1.5 p-1 text-blue-600 hover:text-blue-800">
            <Search size={20} />
          </button>
        </form>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {/* Доступно всім зареєстрованим */}
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

              {/* Доступно тільки персоналу */}
              {(user.role === 'Admin' || user.role === 'Manager') && (
                <Link to="/admin" className="flex items-center gap-1 hover:text-blue-200">
                  <Settings size={18} /> Панель
                </Link>
              )}

              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-blue-400">
                <UserIcon size={18} /><span className="text-sm font-medium">{user.email.split('@')[0]}</span>
                <button onClick={logout} className="ml-2 text-blue-200 hover:text-white" title="Вийти"><LogOut size={20} /></button>
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