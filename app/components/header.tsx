import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CircleAlert, HelpCircle, LifeBuoy, LogOut, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  cartItemCount: number;
}

const Header: React.FC<HeaderProps> = ({ cartItemCount }) => {
  const [activeLink, setActiveLink] = useState('');
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const jwt = require('jsonwebtoken');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for dropdown
  const router = useRouter();

  const handleNavigation = () => {
    setActiveLink(window.location.pathname);
  };

  const handleLogout = () => {
    setShowLogoutAlert(true);
  };

  const closeLogoutAlert = () => {
    setShowLogoutAlert(false);
  };

  const confirmLogout = () => {
    setShowLogoutAlert(false);
    router.push('/'); // Redirect to the home page after logout
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setShowLogoutAlert(false); // Ensure that the logout alert is hidden when toggling the dropdown
  };

  useEffect(() => {
    handleNavigation();
    window.addEventListener('popstate', handleNavigation);
    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  return (
    <>
      <header className="bg-black text-white sm:p-0 p-4 flex flex-col sm:flex-row items-center sm:items-start shadow-md">
        <div className="flex justify-center sm:justify-start sm:mr-auto mb-4 sm:mb-0 sm:ml-7 ml-3">
          <Link href="products">
            <img
              src="img/image 15.webp"
              alt="Logo"
              className="w-28 h-16"
            />
          </Link>
        </div>
        <div className="flex justify-center sm:ml-auto sm:justify-end w-full sm:mt-4 mt-0 sm:mr-6 mr-0">
          <div className="flex flex-row space-x-6 sm:mr-7 mr-3">
            <Link href="products">
              <span
                onClick={handleNavigation}
                className={`relative pb-2 cursor-pointer transition duration-300 ease-in-out hover:text-white ${
                  activeLink === 'products' ? 'text-white' : 'text-gray-400'
                }`}
              >
                Home
                {activeLink === 'products' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded transition-all duration-300 ease-in-out"></div>
                )}
              </span>
            </Link>
            <Link href="/order-history">
              <span
                onClick={handleNavigation}
                className={`relative pb-2 cursor-pointer transition duration-300 ease-in-out hover:text-white ${
                  activeLink === '/order-history' ? 'text-white' : 'text-gray-400'
                }`}
              >
                Previous Orders
                {activeLink === '/order-history' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#EFDF00] rounded transition-all duration-300 ease-in-out hover:text-[#EFDF00]"></div>
                )}
              </span>
            </Link>
            <Link href="/cart">
  <span
    onClick={handleNavigation}
    className={`relative pb-2 cursor-pointer transition duration-300 ease-in-out flex items-center gap-1 hover:text-white ${
      activeLink === '/cart' ? 'text-white' : 'text-gray-400'
    }`}
  >
    Cart
    {cartItemCount > 0 && (
  <span className="absolute -top-3 left-6 px-2 py-1 text-[10px] font-bold text-white bg-red-800 rounded-full">
    {cartItemCount}
  </span>
)}

    {activeLink === '/cart' && (
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#EFDF00] rounded transition-all duration-300 ease-in-out"></div>
    )}
  </span>
</Link>
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="relative pb-2 cursor-pointer transition duration-300 ease-in-out text-gray-400 hover:text-white"
              >
                <UserCircle size={24} />
              </button>
              <AnimatePresence>
  {isDropdownOpen && (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`absolute right-0 mt-3 ${showLogoutAlert ? 'w-64 h-28 ' : 'w-44 h-auto'} rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-[1000]`}
    >
      {!showLogoutAlert ? (
        <div className="py-1">
          <Link href="/profile" className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900">
            <UserCircle className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            Profile
          </Link>
          <Link href="/help" className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900">
            <HelpCircle className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            Help
          </Link>
          <Link href="/support" className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900">
            <LifeBuoy className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            Support
          </Link>
          <button
            onClick={handleLogout}
            className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
            Logout
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="px-5 py-7"
        >
          <h2 className="text-sm text-clip text-nowrap font-sans text-gray-900 mb-3">
            Are you sure you want to log out?
          </h2>
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={closeLogoutAlert}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={confirmLogout}
              className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              Logout
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )}
</AnimatePresence>

    </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
