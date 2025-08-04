"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import gstMapping from '../gst.json';
import states from '../state.json';
interface UserProfile {
  name: string;
  mobile: string;
  gst: string;
  email: string;
  city: string;
  state: string;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (profile: UserProfile) => void;
  userProfile: UserProfile;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userProfile
}) => {
  const [formData, setFormData] = useState<UserProfile>(userProfile);

  useEffect(() => {
    setFormData(userProfile);
  }, [userProfile, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let updatedFormData = { ...formData, [name]: value };

    if (name === 'gst') {
      const gstValue = value.toUpperCase().slice(0, 15);
      updatedFormData = { ...formData, [name]: gstValue };

      if (gstValue) {
        const stateCode = gstValue.substring(0, 2);
        const stateName = (gstMapping as Record<string, string>)[stateCode];
        if (stateName) {
          const stateObj = states.find(s => s.name === stateName);
          if (stateObj) {
            updatedFormData = { ...updatedFormData, state: stateName };
          }
        }
      }
    }

    setFormData(updatedFormData);
  };

  const isFormValid = () => {
    const { name, mobile, gst } = formData;
    return name && mobile && gst;
  };

  const handleConfirm = () => {
    if (isFormValid()) {
      onConfirm(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto mt-7 "
        >
          <div className="flex justify-between items-center p-6 border-b my-auto">
            <h2 className="text-xl font-semibold">Edit Profile</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter company name"
              />
            </div>
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile || ''}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter mobile number"
              />
            </div> */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Number *</label>
              <input
                type="text"
                name="gst"
                value={formData.gst || ''}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter GST Number"
                maxLength={15}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state || ''}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                  placeholder="State"
                  disabled
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                placeholder="Email"
                disabled
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isFormValid()}
              className={`px-4 py-2 rounded-lg font-medium ${
                isFormValid()
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Save
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UserProfileModal;