"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ForgetPasswordModal from '@/app/components/forgetpassword';
import { motion } from 'framer-motion';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [leftBgColor, setLeftBgColor] = useState('#000000');
  const [rightBgColor, setRightBgColor] = useState('#F6F8FD');
  const [errors, setErrors] = useState({ username: '', password: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isValid, setIsValid] = useState(false); 
  const [hasSubmitted, setHasSubmitted] = useState(false); // New state for tracking form submission

  const router = useRouter();

  useEffect(() => {
    const fetchBackgroundColors = async () => {
      try {
        const response = await axios.get('https://api.example.com/background-colors');
        setLeftBgColor(response.data.leftColor);
        setRightBgColor(response.data.rightColor);
      } catch (error) {
        console.error('Failed to fetch background colors:', error);
        setLeftBgColor('#000000');
        setRightBgColor('#F6F8FD');
      }
    };

    fetchBackgroundColors();
  }, []);

  useEffect(() => {
    validate();
  }, [username, password]);

  const validate = () => {
    let valid = true;
    const newErrors = { username: '', password: '' };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      newErrors.username = 'Please enter a valid email address';
      valid = false;
    }

    if (password.trim() === '') {
      newErrors.password = 'Please enter a password';
      valid = false;
    }

    setErrors(newErrors);
    setIsValid(valid);
  };

  const handleSubmit = async (event:any) => {
    event.preventDefault();
    setHasSubmitted(true); // Set the flag to true when submitting

    if (isValid) {
      try {
        const response = await axios.post('http://localhost:3307/api/login', {
          username,
          password,
        });

        if (response.status === 200) {
          const { token } = response.data;
          localStorage.setItem('token', token);
          // router.push('/products');
        }
      } catch (error) {
        console.error('Login failed:', error);
        setErrors({
          username: 'Invalid username or password',
          password: 'Invalid username or password',
        });
        toast.error('Invalid username or password');
      }
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full md:w-1/2 flex justify-center items-center"
        style={{ backgroundColor: leftBgColor }}
      >
        <div className="text-center md:text-left">
          <motion.img
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            src="/img/logo.png"
            alt="Logo"
            className="mx-auto mt-3 sm:mt-0 sm:mb-4 w-1/4 sm:w-auto"
          />
          <motion.img
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            src="/img/car.png"
            alt="Car"
            className="mx-auto md:mx-0"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full md:w-1/2 flex justify-center items-center p-6 md:p-0"
        style={{ backgroundColor: rightBgColor }}
      >
        <div className='absolute top-24 hidden md:block'>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl font-light font-sans text-center tracking-widest"
          >
            Welcome!
          </motion.h1>
        </div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white p-10 rounded-lg shadow-lg w-full max-w-sm"
        >
          <form onSubmit={handleSubmit}>
            <h2 className="text-lg font-light font-sans mb-4">LOGIN NOW</h2>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium font-sans text-gray-700 mb-2">Enter Login ID</label>
              <motion.input 
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                type="text" 
                id="username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className={`w-full px-4 py-2 border ${errors.username && hasSubmitted ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`} 
                placeholder="Enter Login ID"
              />
              {errors.username && hasSubmitted && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium font-sans text-gray-700 mb-2">Enter Password</label>
              <motion.input 
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                type="password" 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className={`w-full px-4 py-2 border ${errors.password && hasSubmitted ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`} 
                placeholder="Enter Password"
              />
              {errors.password && hasSubmitted && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            <div className="text-sm text-left mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={openModal}
                className="hover:underline text-blue-600"
              >
                Forgot Password?
              </motion.button>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit" 
              disabled={!isValid}
              className={`w-full bg-black text-white justify-center py-2 px-4 inline-flex gap-2 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50 rounded-md transition-colors duration-200 ${!isValid ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Confirm 
              <ArrowRight color="#ffffff" strokeWidth={1.25} />
            </motion.button>
          </form>
        </motion.div>
      </motion.div>

      <ForgetPasswordModal isOpen={isModalOpen} onClose={closeModal} />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}
