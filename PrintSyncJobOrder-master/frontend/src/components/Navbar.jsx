import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, userRole, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-primary hover:text-secondary transition">
          Cache Prints
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/store" className="text-primary hover:text-secondary font-medium transition text-sm">
            Store
          </Link>
          {user && userRole === 'customer' && (
            <>
              <Link to="/customize" className="text-primary hover:text-secondary font-medium transition text-sm">
                Customize
              </Link>
              <Link to="/orders" className="text-primary hover:text-secondary font-medium transition text-sm">
                Orders
              </Link>
            </>
          )}
          {user && userRole === 'admin' && (
            <>
              <Link to="/admin/dashboard" className="text-primary hover:text-secondary font-medium transition text-sm">
                Dashboard
              </Link>
              <Link to="/admin/products" className="text-primary hover:text-secondary font-medium transition text-sm">
                Products
              </Link>
              <Link to="/admin/orders" className="text-primary hover:text-secondary font-medium transition text-sm">
                Orders
              </Link>
            </>
          )}
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:inline text-sm text-gray-600">{user.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-border rounded hover:bg-light text-primary font-medium transition text-sm"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-primary hover:text-secondary font-medium transition text-sm"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-primary hover:bg-gray-800 text-white rounded font-medium transition text-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
