import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Database, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button/Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Database className="text-blue-600" size={32} />
              <span className="text-xl font-bold text-gray-900">Data Intelligence</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <User size={20} />
              <span className="text-sm">{user?.fullName || user?.email}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;