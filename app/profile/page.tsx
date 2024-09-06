"use client"
import React, { useState } from 'react';
import Header from '@/app/components/header';

function ProfilePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <main className='bg-gray-50 min-h-screen'>
        <Header cartItemCount={0}/>
        <div className="flex flex-col items-center py-20">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
                <h1 className="text-3xl font-semibold mb-6">Kailash</h1>
                <p className="mb-3"><span className="font-medium">Email:</span> Kailash91@gmail.com</p>
                <p className="mb-3"><span className="font-medium">Username:</span> Kailash91</p>
                <p className="mb-4"><span className="font-medium">Dealers Mapped:</span> TEST01</p>
                <button 
                  className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
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

function ChangePasswordModal({ closeModal }:any) {
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
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 pr-10"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
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
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 pr-10"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                <i 
                  className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} 
                  onClick={togglePasswordVisibility}
                />
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
