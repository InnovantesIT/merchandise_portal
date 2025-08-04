"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import states from '../state.json';
import gstMapping from '../gst.json';

interface BillingAddress {
  address_id: string | null;
  attention: string | null;
  address: string | null;
  street2: string | null;
  city: string | null;
  state: string | null;
  state_code: string | null;
  country: string | null;
  country_code: string | null;
  zip: string | null;
  phone: string | null;
  fax: string | null;
  gst_no?: string;
  email?: string;
}

interface BillingAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (address: BillingAddress) => void;
  billingAddress: BillingAddress;
  updateError: string | null;
}

const BillingAddressModal: React.FC<BillingAddressModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  billingAddress,
  updateError
}) => {
  const [formData, setFormData] = useState<BillingAddress>(billingAddress);
  const [gstError, setGstError] = useState<string | null>(null);

  useEffect(() => {
    setFormData(billingAddress);
  }, [billingAddress, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let updatedFormData = { ...formData, [name]: value };

    if (name === 'gst_no') {
      setGstError(null);
      const gstValue = value.toUpperCase().slice(0, 15);
      updatedFormData = { ...formData, [name]: gstValue };

      if (!gstValue) {
        updatedFormData = { ...updatedFormData, state: '', state_code: '' };
      } else {
        const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
        if (gstValue.startsWith('97') || gstValue.startsWith('99')) {
          setGstError("Please enter a GST number for a different state.");
          updatedFormData = { ...updatedFormData, state: '', state_code: '' };
        } else if (!gstRegex.test(gstValue)) {
          setGstError("Invalid GST Number format.");
          updatedFormData = { ...updatedFormData, state: '', state_code: '' };
        } else {
          const stateCode = gstValue.substring(0, 2);
          const stateName = (gstMapping as Record<string, string>)[stateCode];
          if (stateName === '-') {
            updatedFormData = { ...updatedFormData, state: '-', state_code: '' };
          } else if (stateName) {
            const stateObj = states.find(s => s.name === stateName);
            if (stateObj) {
              updatedFormData = { ...updatedFormData, state: stateName, state_code: stateObj.code };
            } else {
              updatedFormData = { ...updatedFormData, state: '', state_code: '' };
            }
          } else {
            updatedFormData = { ...updatedFormData, state: '', state_code: '' };
          }
        }
      }
    }

    setFormData(updatedFormData);
  };

  const isFormValid = () => {
    const { attention, gst_no, address, city, state } = formData;
    return attention && gst_no && address && city && state && !gstError;
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
          className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold">Edit Billing Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                name="attention"
                value={formData.attention || ''}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Number *</label>
              <input
                type="text"
                name="gst_no"
                value={formData.gst_no || ''}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter GST Number"
                maxLength={15}
              />
              {gstError && <p className="text-red-500 text-sm mt-1">{gstError}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                placeholder="Enter billing address"
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
           
          </div>
          {updateError && <p className="text-red-500 text-sm p-6 pt-0">{updateError}</p>}
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
              Apply
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BillingAddressModal;