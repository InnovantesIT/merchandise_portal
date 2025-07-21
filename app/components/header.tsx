import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, LogOut, UserCircle, LifeBuoy, House, Package, ShoppingCart, Phone, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  cartItemCount: number;
}

const Header: React.FC<HeaderProps> = ({ cartItemCount }) => {
  const [activeLink, setActiveLink] = useState('');
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [role, setRole] = useState('');
  const router = useRouter();

  const handleNavigation = () => {
    if (typeof window !== 'undefined') {
      setActiveLink(window.location.pathname);
    }
  };

  const handleLogout = () => {
    setShowLogoutAlert(true);
    setIsDrawerOpen(false);
  };

  const closeLogoutAlert = () => {
    setShowLogoutAlert(false);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role'); 
    localStorage.removeItem('customer_id')
    localStorage.removeItem('first_name')
    localStorage.removeItem('username')
    setShowLogoutAlert(false);

    setTimeout(() => {
      router.push('/');
    }, 100);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
    setShowLogoutAlert(false);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen((prev) => !prev);
    setShowLogoutAlert(false);
  };

  useEffect(() => {
    handleNavigation();
    window.addEventListener('popstate', handleNavigation);
    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('role');
    if (storedUsername) {
      setUsername(storedUsername);
    }
    if (storedRole) {
      setRole(storedRole);
      if (storedRole === 'oem' && window.location.pathname !== '/dealer-orders') {
        router.push('/dealer-orders');
      }
    }
  }, [router]);

  useEffect(() => {
    if (isDrawerOpen || showLogoutAlert) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isDrawerOpen, showLogoutAlert]);

  return (
    <header className="bg-black text-white sm:p-0 flex flex-col sm:flex-row items-center sm:items-start sm:min-h-[100px] sm:sticky sm:top-0 z-[1000]">
      <div className="flex justify-between items-center w-full sm:w-auto sm:mr-auto mb-4 sm:mb-0 sm:ml-7 ml-3">
        <Link href={role === 'oem' ? '/dealer-orders' : '/products'} className="block">
          <div className="relative sm:w-[150px] sm:h-[50px] w-[90px] h-[40px]  cursor-pointer">
            <img
              src="/img/headerlogo.png"
              alt="Logo"
              className="hidden sm:block mt-6"
            />
            <img
              src="/img/headerlogo.png"
              alt="Logo"
              className="block sm:hidden mt-3 h-10"
            />
          </div>
        </Link>
        <button
          onClick={toggleDrawer}
          className="sm:hidden p-2 text-white focus:outline-none mr-1"
          aria-label="Toggle navigation"
        >
          {isDrawerOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden sm:flex justify-center sm:ml-auto sm:justify-end w-full sm:mt-8 mt-0 text-xl">
        <div className="flex flex-row space-x-6 sm:mr-7 mr-3">
          {role !== 'oem' && (
            <>
              <Link href="/products">
                <span
                  onClick={handleNavigation}
                  className={`relative pb-2 cursor-pointer transition duration-300 ease-in-out hover:text-white ${
                    activeLink === '/products' ? 'text-white' : 'text-gray-400'
                  }`}
                >
                  Home
                  {activeLink === '/products' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#EFDF00] rounded transition-all duration-300 ease-in-out"></div>
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
                  Order History
                  {activeLink === '/order-history' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#EFDF00] rounded transition-all duration-300 ease-in-out"></div>
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
                    <span className="absolute -top-5 -right-4 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {cartItemCount}
                    </span>
                  )}
                  {activeLink === '/cart' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#EFDF00] rounded transition-all duration-300 ease-in-out"></div>
                  )}
                </span>
              </Link>
            </>
          )}

          {role === 'oem' && (
            <Link href="/dealer-orders">
              <span
                onClick={handleNavigation}
                className={`relative pb-2 cursor-pointer transition duration-300 ease-in-out hover:text-white ${
                  activeLink === '/dealer-orders' ? 'text-white' : 'text-gray-400'
                }`}
              >
                Dealer Orders
                {activeLink === '/dealer-orders' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#EFDF00] rounded transition-all duration-300 ease-in-out"></div>
                )}
              </span>
            </Link>
          )}
          {/* Profile and Support links */}
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="relative pb-2 cursor-pointer transition duration-300 ease-in-out text-gray-400 hover:text-white"
              aria-label="User options"
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
                  className="absolute right-0 mt-3 w-54 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-[1000]"
                >
                 <div className="py-1">
  <a
    href="https://toplineindia.com/about-us/"
    target="_blank"
    rel="noopener noreferrer"
    className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
  >
    <ExternalLink className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
    About Us
  </a>
  <Link href="/profile">
    <div className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer">
      <UserCircle className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
      Profile
    </div>
  </Link>
  <a
    href="mailto:support1@toplineindia.com"
    target="_blank"
    rel="noopener noreferrer"
    className="group flex flex-col items-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
  >
    <span className="flex items-center">
      <LifeBuoy className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
      Email Support
    </span>
    <span className="ml-8 text-xs text-gray-400 flex  text-wrap">support1@toplineindia.com</span>
  </a>
  <a
    href="tel:+919711634046"
    className="group flex flex-col items-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
  >
    <span className="flex items-center">
      <Phone className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
      Tel Support
    </span>
    <span className="ml-8 text-xs text-gray-400">+91 9711634046</span>
  </a>
  <button
    onClick={handleLogout}
    className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
  >
    <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
    Logout
  </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 ml-auto z-50 bg-black bg-opacity-90 flex flex-col p-6 px-10 sm:hidden"
          >
            <div className="flex justify-end">
              <button onClick={toggleDrawer} className="p-2 text-white focus:outline-none">
                <X size={24} />
              </button>
            </div>
            <nav className="mt-10 gap-y-7 flex flex-col">
              {role !== 'oem' && (
                <>
                  <Link href="/products">
                    <div className="flex gap-2">
                      <House size={24} strokeWidth={2} />
                      <span
                        onClick={toggleDrawer}
                        className={`block text-xl cursor-pointer transition duration-300 ease-in-out font-sans ${
                          activeLink === '/products' ? 'text-[#EFDF00]' : 'text-white'
                        } hover:text-[#EFDF00] tracking-wide`}
                      >
                        Home
                      </span>
                    </div>
                  </Link>
                  <Link href="/order-history">
                    <div className="flex gap-3">
                      <Package />
                      <span
                        onClick={toggleDrawer}
                        className={`block text-xl cursor-pointer transition duration-300 ease-in-out font-sans ${
                          activeLink === '/order-history' ? 'text-[#EFDF00]' : 'text-white'
                        } hover:text-[#EFDF00] tracking-wide`}
                      >
                        Order History
                      </span>
                    </div>
                  </Link>

                  <Link href="/cart">
                    <div className="flex gap-3">
                      <ShoppingCart />
                      <span
                        onClick={toggleDrawer}
                        className={`block text-xl cursor-pointer transition duration-300 ease-in-out font-sans w-full ${
                          activeLink === '/cart' ? 'text-[#EFDF00]' : 'text-white'
                        } flex items-center hover:text-[#EFDF00] tracking-wide`}
                      >
                        Cart
                        {cartItemCount > 0 && (
                          <span className="ml-2 px-2 py-1 text-sm text-white bg-red-800 rounded-full font-sans">
                            {cartItemCount}
                          </span>
                        )}
                      </span>
                    </div>
                  </Link>
                </>
              )}

              {role === 'oem' && (
                <Link href="/dealer-orders">
                  <div className="flex gap-3">
                    <House />
                    <span
                      onClick={toggleDrawer}
                      className={`block text-xl cursor-pointer transition duration-300 ease-in-out font-sans ${
                        activeLink === '/dealer-orders' ? 'text-[#EFDF00]' : 'text-white'
                      } hover:text-[#EFDF00] tracking-wide`}
                    >
                      Dealer Orders
                    </span>
                  </div>
                </Link>
              )}

              {/* Profile, Support, and Logout for mobile */}
              <a
                href="https://toplineindia.com/about-us/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3"
              >
                <ExternalLink />
                <span className="block text-xl cursor-pointer transition duration-300 ease-in-out text-white hover:text-[#EFDF00] font-sans">
                  About Us
                </span>
              </a>
              <Link href="/profile">
                <div className="flex gap-3">
                  <UserCircle />
                  <span className="block text-xl cursor-pointer transition duration-300 ease-in-out text-white hover:text-[#EFDF00] font-sans">
                    Profile
                  </span>
                </div>
              </Link>
              <div className="flex flex-col gap-1">
                <div className="flex gap-3 items-center">
                  <LifeBuoy />
                  <a
                    href="mailto:support1@toplineindia.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xl cursor-pointer transition duration-300 ease-in-out text-white hover:text-[#EFDF00] font-sans"
                  >
                    Email Support
                  </a>
                </div>
                <span className="ml-8 text-xs text-gray-400">support1@toplineindia.com</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex gap-3 items-center">
                  <Phone />
                  <a
                    href="tel:+919711634046"
                    className="block text-xl cursor-pointer transition duration-300 ease-in-out text-white hover:text-[#EFDF00] font-sans"
                  >
                    Tel Support
                  </a>
                </div>
                <span className="ml-8 text-xs text-gray-400">+91 9711634046</span>
              </div>
              <div className="flex gap-3">
                <LogOut />
                <button
                  onClick={handleLogout}
                  className="block text-xl cursor-pointer transition duration-300 ease-in-out text-white hover:text-[#EFDF00] font-sans text-start"
                >
                  Logout
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Alert */}
      <AnimatePresence>
        {showLogoutAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center p-4 bg-black bg-opacity-50"
          >
            <div className="bg-white rounded-lg lg:p-8 p-6 w-full max-w-sm items-center place-content-center mx-auto">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Are you sure you want to log out?
              </h2>
              <div className="flex justify-end gap-4">
                <button
                  onClick={closeLogoutAlert}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
