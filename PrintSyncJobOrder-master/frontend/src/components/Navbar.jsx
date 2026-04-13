import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const CartIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
  </svg>
);

const MenuIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function Navbar() {
  const { user, userRole, logout } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkClass = (path) =>
    `text-sm font-medium transition-colors pb-0.5 border-b-2 ${
      pathname === path || pathname.startsWith(path)
        ? 'text-[#111] border-[#111] font-semibold'
        : 'text-gray-500 border-transparent hover:text-[#111]'
    }`;

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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/logo1.png" alt="PrintSync" className="h-10 w-auto object-contain" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/store" className={navLinkClass('/store')}>Store</Link>

          {/* Customer links */}
          {user && userRole === 'customer' && (
            <>
              <Link to="/customize" className={navLinkClass('/customize')}>Customize</Link>
              <Link to="/orders" className={navLinkClass('/orders')}>Orders</Link>
            </>
          )}

          {/* Admin links */}
          {user && userRole === 'admin' && (
            <>
              <Link to="/admin/dashboard" className={navLinkClass('/admin/dashboard')}>Dashboard</Link>
              <Link to="/admin/products" className={navLinkClass('/admin/products')}>Products</Link>
              <Link to="/admin/orders" className={navLinkClass('/admin/orders')}>Orders</Link>
            </>
          )}

          {/* Not logged in — show Home */}
          {!user && (
            <Link to="/" className={navLinkClass('/')}>Home</Link>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Cart icon (customers only) */}
              {userRole === 'customer' && (
                <Link to="/orders" className="relative flex items-center gap-1 text-sm text-gray-600 hover:text-[#111] transition-colors mr-1">
                  <CartIcon />
                  <span className="text-xs font-medium">Cart</span>
                  <span className="absolute -top-1 -right-2 w-2 h-2 bg-secondary rounded-full" />
                </Link>
              )}
              <span className="hidden sm:inline text-xs text-gray-400">{user.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-gray-300 text-[#111] text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Cart icon */}
              <Link to="/login" className="relative flex items-center gap-1 text-sm text-gray-600 hover:text-[#111] transition-colors mr-1">
                <CartIcon />
                <span className="text-xs font-medium">Cart</span>
                <span className="absolute -top-1 -right-2 w-2 h-2 bg-secondary rounded-full" />
              </Link>

              <Link
                to="/login"
                className="px-5 py-2 bg-[#111] text-white text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                Sign In
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden ml-2 text-[#111]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-6 py-4 space-y-3">
          <Link to="/store" className="block text-sm font-semibold text-[#111]" onClick={() => setMobileMenuOpen(false)}>Store</Link>

          {user && userRole === 'customer' && (
            <>
              <Link to="/customize" className="block text-sm text-gray-600" onClick={() => setMobileMenuOpen(false)}>Customize</Link>
              <Link to="/orders" className="block text-sm text-gray-600" onClick={() => setMobileMenuOpen(false)}>Orders</Link>
            </>
          )}

          {user && userRole === 'admin' && (
            <>
              <Link to="/admin/dashboard" className="block text-sm text-gray-600" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
              <Link to="/admin/products" className="block text-sm text-gray-600" onClick={() => setMobileMenuOpen(false)}>Products</Link>
              <Link to="/admin/orders" className="block text-sm text-gray-600" onClick={() => setMobileMenuOpen(false)}>Orders</Link>
            </>
          )}

          {!user && (
            <Link to="/" className="block text-sm text-gray-600" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          )}

          <div className="pt-3 border-t border-gray-200">
            {user ? (
              <button onClick={handleLogout} className="w-full text-left text-sm font-semibold text-red-500">
                Logout
              </button>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="flex-1 text-center py-2 border border-gray-300 text-sm font-semibold text-[#111]" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
                <Link to="/register" className="flex-1 text-center py-2 bg-[#111] text-white text-sm font-semibold" onClick={() => setMobileMenuOpen(false)}>
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}