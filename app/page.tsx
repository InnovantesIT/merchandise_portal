"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ForgetPasswordModal from '@/app/components/forgetpassword';
import { motion } from 'framer-motion';

export default function Login() {
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // Array to handle OTP inputs
  const [leftBgColor, setLeftBgColor] = useState('#000000');
  const [rightBgColor, setRightBgColor] = useState('#F6F8FD');
  const [errors, setErrors] = useState({ username: '', otp: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [hashedOtp, setHashedOtp] = useState(''); // State to store hashed OTP received from server
  const [timer, setTimer] = useState(120); // Timer for 2 minutes
  const [canResend, setCanResend] = useState(false); // State to manage resend button
  const [loading, setLoading] = useState({ validateUsername: false, validateOtp: false, resendOtp: false }); // Loaders
  const router = useRouter();
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]); // Allow null in refs

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
  }, [username, otp, step]);

  useEffect(() => {
    if (step === 'otp' && timer > 0) {
      const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(countdown);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [step, timer]);

  const validate = () => {
    let valid = true;
    const newErrors = { username: '', otp: '' };
  
    if (step === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
      if (username.trim() === '') {
        newErrors.username = "Field can't be empty";
        valid = false;
      } else if (!emailRegex.test(username)) {
        newErrors.username = 'Please enter a valid email address';
        valid = false;
      }
    }
  
    // Validate OTP only if form is submitted on the OTP step
    if (step === 'otp' && hasSubmitted) {
      if (otp.some((digit) => digit === '')) {
        newErrors.otp = "OTP can't be empty";
        valid = false;
      }
    }
  
    setErrors(newErrors);
    setIsValid(valid);
  };
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setHasSubmitted(true); // Set this to true on submit to trigger validation
  
    validate(); // Call validate after setting hasSubmitted to ensure errors are updated based on submission
  
    if (isValid) {
      try {
        if (step === 'email') {
          setLoading((prev) => ({ ...prev, validateUsername: true }));
          const response = await axios.post(`${baseURL}/api/validate-email`, { username });
  
          if (response.status === 200) {
            setHashedOtp(response.data.hashedOtp); // Store the hashed OTP
            setStep('otp');
            setHasSubmitted(false); // Reset submission state for next step
            toast.success('Email validated. Please enter the OTP sent to your email.');
            setTimer(120); // Reset timer for OTP regeneration
            setCanResend(false); // Disable resend button initially
          }
        } else if (step === 'otp') {
          setLoading((prev) => ({ ...prev, validateOtp: true }));
          const fullOtp = otp.join('');
          const response = await axios.post(`${baseURL}/api/validate-otp`, { 
            username, 
            otp: fullOtp, 
            hashedOtp // Send the stored hashed OTP
          });
  
          if (response.status === 200) {
            const { token, name, customer_id,role } = response.data;
            if (typeof window !== 'undefined') {
              localStorage.setItem('token', token);
              localStorage.setItem('username', username);
              localStorage.setItem('name', name);
              localStorage.setItem('customer_id', customer_id);
              localStorage.setItem('role', role);

            }
            router.push('/products'); // Redirect to products page
          }
        }
      } catch (error: any) {
        console.error('Validation failed:', error.response || error);
        const errorMessage = step === 'email' ? 'Invalid username' : 'Invalid OTP';
        setErrors({
          username: step === 'email' ? errorMessage : '',
          otp: step === 'otp' ? errorMessage : '',
        });
        toast.error('Validation failed');
      } finally {
        setLoading({ validateUsername: false, validateOtp: false, resendOtp: false });
      }
    }
  };
  
  const handleOtpChange = (value: string, index: number) => {
    if (/^\d$/.test(value) || value === '') {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value !== '' && index < otp.length - 1) {
        otpRefs.current[index + 1]?.focus(); // Safely access the next input
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs.current[index - 1]?.focus(); // Safely move focus to the previous input
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus(); // Safely move focus to the previous input
    } else if (e.key === 'ArrowRight' && index < otp.length - 1) {
      otpRefs.current[index + 1]?.focus(); // Safely move focus to the next input
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading((prev) => ({ ...prev, resendOtp: true }));
      const response = await axios.post(`${baseURL}/api/resend-otp`, { username });

      if (response.status === 200) {
        setHashedOtp(response.data.hashedOtp); // Update the hashed OTP
        toast.success('OTP resent successfully.');
        setTimer(120); // Reset timer after resending OTP
        setCanResend(false); // Disable the resend button
      }
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      toast.error('Failed to resend OTP');
    } finally {
      setLoading((prev) => ({ ...prev, resendOtp: false }));
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
            <h2 className="text-lg font-light font-sans mb-4">{step === 'email' ? 'LOGIN NOW' : 'ENTER OTP'}</h2>
            {step === 'email' ? (
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium font-sans text-gray-700 mb-2">Enter Registered Email</label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  className={`w-full px-4 py-2 border ${errors.username && hasSubmitted ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter Email Address"
                />
                {errors.username && hasSubmitted && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
              </div>
            ) : (
              <div className="mb-6">
                <label className="block text-sm font-medium font-sans text-gray-700 mb-2">Enter OTP</label>
                <div className="flex justify-between">
                  {otp.map((digit, index) => (
                    <motion.input
  key={index}
  ref={(el) => {
    otpRefs.current[index] = el; // Just assign without returning anything
  }}
  type="text"
  maxLength={1} // maxLength should be a number
  value={digit}
  onChange={(e) => handleOtpChange(e.target.value, index)}
  onKeyDown={(e) => handleKeyDown(e, index)}
  className="w-12 h-12 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
/>

                  ))}
                </div>
                {errors.otp && hasSubmitted && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
                <div className="flex items-center justify-between mt-4">
  <button
    type="button"
    onClick={handleResendOtp}
    className={`text-black focus:outline-none ${canResend && !loading.resendOtp ? '' : 'opacity-50 cursor-not-allowed'}`}
    disabled={!canResend || loading.resendOtp}
  >
    {loading.resendOtp ? 'Resending...' : 'Resend OTP'}
  </button>
  {!canResend && (
    <span className="text-sm text-gray-500">
      Resend in {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')} seconds
    </span>
  )}
</div>

              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className={`w-full bg-black text-white justify-center py-2 px-4 inline-flex gap-2 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50 rounded-md transition-colors duration-200 ${!isValid || loading.validateUsername || loading.validateOtp ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading.validateUsername || loading.validateOtp}
            >
              {step === 'email' && loading.validateUsername ? 'Validating...' : step === 'otp' && loading.validateOtp ? 'Validating...' : 'Confirm'}
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

