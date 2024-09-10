"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/app/components/header';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation

function ProfilePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const router = useRouter(); // Initialize router for navigation

  useEffect(() => {
    // Check if the user is authenticated by looking for a token in local storage
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to home page if no token is found
      // router.push('/');
    } else {
      // Fetch user details from local storage
      const storedEmail = localStorage.getItem('username');
      const storedName = localStorage.getItem('name');

      if (storedEmail) setEmail(storedEmail);
      if (storedName) setName(storedName);
    }
  }, [router]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <main className='bg-gray-50 min-h-screen'>
      <Header cartItemCount={0} />
      <div className="flex flex-col items-center py-20">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
          <h1 className="text-3xl font-semibold mb-6">{name}</h1>
          <p className="mb-3"><span className="font-medium">Email:</span> {username}</p>
          <p className="mb-3"><span className="font-medium">Username:</span> {name}</p>
          <button 
            className="mt-4 inline-flex items-center text-black hover:text-black"
            onClick={openModal}
          >
            <i className="fas fa-lock mr-2"></i>Change Password
          </button>
        </div>
        {isModalOpen && <ChangePasswordModal closeModal={closeModal} />}
      </div>
    </main>
  );
}

function ChangePasswordModal({ closeModal }) {
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Change password</h2>
          <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">New password</label>
            <div className="mt-1 relative">
              <input
                type={showPassword ? "text" : "password"}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black  focus:border-black pr-10"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer">
                <i 
                  className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} 
                  onClick={togglePasswordVisibility}
                />
              </div>
            </div>
            <label className="block text-sm font-medium text-gray-700 mt-3">Confirm password</label>
            <div className="mt-1 relative">
              <input
                type={showPassword ? "text" : "password"}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black pr-10"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 cursor-pointer">
                <i 
                  className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} 
                  onClick={togglePasswordVisibility}
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bgblacke-600 text-white px-4 py-2 rounded-md hover:bg-black"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
