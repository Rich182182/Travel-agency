import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUsers } from '../api/storage';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Будь ласка, заповніть всі поля');
      return;
    }
    
    const users = getUsers();
    const foundUser = users.find(u => u.email === email.toLowerCase());

    if (!foundUser) {
      setError('Користувача з таким email не знайдено');
      return;
    }

    if (foundUser.password !== password) {
      setError('Невірний пароль');
      return;
    }

    login(foundUser);
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-2xl shadow-md border border-gray-100">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Вхід в акаунт</h1>
      
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Email</label>
          <input 
            type="email" 
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="admin@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-1">Пароль</label>
          <input 
            type="password" 
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-2">Стандартний пароль для тестових акаунтів: 123456</p>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors mt-4">
          Увійти
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        Ще немає акаунту? <Link to="/register" className="text-blue-600 font-bold hover:underline">Зареєструватися</Link>
      </p>
    </div>
  );
}