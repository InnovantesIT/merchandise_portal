"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ForgetPasswordModal from '@/app/components/forgetpassword';
import { motion, AnimatePresence } from 'framer-motion';
import { encrypt, decrypt } from '@/app/action/enc'; // Import encryption functions
export default function Login() {
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [leftBgColor, setLeftBgColor] = useState('#000000');
  const [rightBgColor, setRightBgColor] = useState('#F6F8FD');
  const [errors, setErrors] = useState({ username: '', otp: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [step, setStep] = useState('email');
  const [hashedOtp, setHashedOtp] = useState('');
  const [timer, setTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState({ validateUsername: false, validateOtp: false, resendOtp: false });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [brand, setBrand] = useState('renault'); // Initialize brand
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 2000);

  })
  const validate = useCallback(() => {
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

    if (step === 'otp' && hasSubmitted) {
      if (otp.some((digit) => digit === '')) {
        newErrors.otp = "OTP can't be empty";
        valid = false;
      }
    }

    setErrors(newErrors);
    setIsValid(valid);
  }, [username, otp, step, hasSubmitted]);

  useEffect(() => {
    validate();
  }, [validate]);

  useEffect(() => {
    if (step === 'otp' && timer > 0) {
      const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(countdown);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [step, timer]);

  const formatTime = (seconds: any) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  const handleSubmit = async (event:any) => {
    event.preventDefault();
    setHasSubmitted(true);
    validate();
  
    if (isValid) {
      try {
        if (step === 'email') {
          setLoading((prev) => ({ ...prev, validateUsername: true }));
          const response = await axios.post(`${baseURL}/api/login`, { email: username, brand });
  
          if (response.status === 200) {
            setHashedOtp(response.data.hashedOtp);
            setStep('otp');
            setHasSubmitted(false);
            toast.success('Email validated. Please enter the OTP sent to your email.');
            setTimer(120);
            setCanResend(false);
          }
        } else if (step === 'otp') {
          setLoading((prev) => ({ ...prev, validateOtp: true }));
          const fullOtp = otp.join('');
          const response = await axios.post(`${baseURL}/api/verify-otp`, {
            email: username,
            otp: fullOtp,
            brand,
          });
  
          if (response.status === 200) {
            if (typeof window !== 'undefined') {
              const encryptedToken = encrypt(response.data.data.token); // Encrypt token
              localStorage.setItem('token', encryptedToken);
              localStorage.setItem('username', response.data.data.username);
              localStorage.setItem('first_name', response.data.data.first_name);
              localStorage.setItem('customer_id', response.data.data.customer_id);
              localStorage.setItem('role', response.data.data.role);


            }
            router.push('/products');
          }
        }
      } catch (error:any) {
        if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('customer_id');
        localStorage.removeItem('first_name');
        localStorage.removeItem('username');
        
          router.push('/'); 
          return;
        }
  
        const errorMessage = error.response?.data?.message || 'Validation failed';
        setErrors({
          username: step === 'email' ? errorMessage : '',
          otp: step === 'otp' ? errorMessage : '',
        });
        toast.error(errorMessage);
      } finally {
        setLoading({ validateUsername: false, validateOtp: false, resendOtp: false });
      }
    }
  };

  const handleOtpChange = (value: any, index: any) => {
    if (/^\d$/.test(value) || value === '') {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value !== '' && index < otp.length - 1) {
        requestAnimationFrame(() => otpRefs.current[index + 1]?.focus());
      }
    }
  };

  const handleKeyDown = (e: any, index: any) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < otp.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading((prev) => ({ ...prev, resendOtp: true }));
      const fullOtp = otp.join('');
      const response = await axios.post(`${baseURL}/api/verify-otp`, { email: username, otp: fullOtp, brand });

      if (response.status === 200) {
        setHashedOtp(response.data.hashedOtp);
        toast.success('OTP resent successfully.');
        setTimer(120);
        setCanResend(false);
      }
    } catch (error) {
      console.error('Failed to resend OTP:', error);
      toast.error('Failed to resend OTP');
    } finally {
      setLoading((prev) => ({ ...prev, resendOtp: false }));
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <motion.img
          src="/img/Renault_logo_Black.png"
          alt="Loading"
          animate={{
            opacity: [0, 1, 0.6, 1, 0], // Slight variations in opacity for a smoother flicker
          }}
          transition={{
            duration: 4, // Increased duration to slow down the effect
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
          }}
        />
      </div>
    );
  }

  return (
    <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col md:flex-row min-h-screen"
  >
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full md:w-1/2 flex justify-center items-center"
      style={{ backgroundColor: leftBgColor }}
    >
      <div className="text-center md:text-left">
        <motion.img
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
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
      className="w-full md:w-1/2 flex justify-center items-center relative sm:p-0 sm:pt-0 p-6 pt-24"
      style={{ backgroundColor: rightBgColor }}
    >
      <h1 className="text-3xl absolute top-36 items-center tracking-wider font-sans font-light ">Welcome!</h1>
      <div className="text-center mb-4 text-lg font-sans font-semibold">
      </div>
  
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-white p-10 rounded-lg shadow-lg w-full max-w-sm relative flex items-center"
      >
        <AnimatePresence mode="wait">
          <motion.form
            key={step}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-light font-sans">
                {step === 'email' ? 'LOGIN NOW' : 'ENTER OTP'}
              </h2>
              <motion.img
                src="/img/Topline Logo.png"
                alt="Logo"
                className="w-32 h-12 "
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              />
            </div>
            {step === 'email' ? (
              <motion.div className="mb-4" variants={fadeInUp}>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium font-sans text-gray-700 mb-2"
                >
                  Enter Registered Email
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  className={`w-full px-4 py-2 border ${
                    errors.username && hasSubmitted
                      ? 'border-red-500'
                      : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter Email Address"
                  aria-invalid={errors.username ? 'true' : 'false'}
                  aria-describedby={errors.username ? 'username-error' : undefined}
                />
                {errors.username && hasSubmitted && (
                  <p id="username-error" className="text-red-500 text-sm mt-1">
                    {errors.username}
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div className="mb-6" variants={fadeInUp}>
                <div className="flex justify-between">
                  {otp.map((digit, index) => (
                    <motion.input
                      key={index}
                      ref={(el) => {
                        otpRefs.current[index] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="w-12 h-12 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      whileFocus={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                      aria-label={`OTP Digit ${index + 1}`}
                    />
                  ))}
                </div>
                {errors.otp && hasSubmitted && (
                  <p className="text-red-500 text-sm mt-1">{errors.otp}</p>
                )}
                <div className="flex items-center justify-between mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={handleResendOtp}
                    className={`text-black focus:outline-none ${
                      canResend && !loading.resendOtp
                        ? ''
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    disabled={!canResend || loading.resendOtp}
                  >
                    {loading.resendOtp ? 'Resending...' : 'Resend OTP'}
                  </motion.button>
                  {!canResend && (
                    <span className="text-sm text-gray-500">
                      Resend in {formatTime(timer)} seconds
                    </span>
                  )}
                </div>
              </motion.div>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className={`w-full bg-black text-white justify-center py-2 px-4 inline-flex gap-2 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-50 rounded-md transition-colors duration-200 ${
                !isValid || loading.validateUsername || loading.validateOtp
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              disabled={loading.validateUsername || loading.validateOtp}
            >
              {step === 'email' && loading.validateUsername
                ? 'Validating...'
                : step === 'otp' && loading.validateOtp
                ? 'Validating...'
                : 'Confirm'}
              <ArrowRight color="#ffffff" strokeWidth={1.25} />
            </motion.button>
          </motion.form>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  
    <ForgetPasswordModal isOpen={isModalOpen} onClose={closeModal} />
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
  </motion.div>
  
  );
}
