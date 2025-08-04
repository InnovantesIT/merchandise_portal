"use client";

import React, { useState, useEffect } from 'react';
import { Edit3,ShieldCheck } from 'lucide-react';
import BillingAddressModal from './BillingAddressModal';
import axios from 'axios';
import { decrypt } from '@/app/action/enc';

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

interface BillingDetailsProps {
  onBillingDetailsChange: (details: BillingAddress, isValid: boolean) => void;
  showError: boolean;
}

const BillingDetails: React.FC<BillingDetailsProps> = ({ onBillingDetailsChange, showError }) => {
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    address_id: null,
    attention: '',
    address: '',
    street2: '',
    city: '',
    state: '',
    state_code: '',
    country: 'India',
    country_code: 'IN',
    zip: '',
    phone: '',
    fax: '',
    gst_no: '',
    email: ''
  });
  const [originalBillingAddress, setOriginalBillingAddress] = useState<BillingAddress | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

  const retrieveToken = () => {
    if (typeof window !== 'undefined') {
      const encryptedToken = localStorage.getItem('token');
      if (encryptedToken) {
        return decrypt(encryptedToken);
      }
    }
    return null;
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = retrieveToken();
      if (!token) return;

      try {
        const response = await axios.get(`${baseURL}/api/user-details`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const userData = response.data;
        const fetchedBillingAddress = userData.billing_address || {};
        const userEmail = userData.email || '';

        const initialBillingDetails: BillingAddress = {
          address_id: fetchedBillingAddress.address_id || null,
          attention: fetchedBillingAddress.attention || '',
          address: fetchedBillingAddress.address || '',
          street2: fetchedBillingAddress.street2 || '',
          city: fetchedBillingAddress.city || '',
          state: fetchedBillingAddress.state || '',
          state_code: fetchedBillingAddress.state_code || '',
          country: fetchedBillingAddress.country || 'India',
          country_code: fetchedBillingAddress.country_code || 'IN',
          zip: fetchedBillingAddress.zip || '',
          phone: fetchedBillingAddress.phone || '',
          fax: fetchedBillingAddress.fax || '',
          gst_no: userData.gst_no || '',
          email: userEmail,
        };

        setBillingAddress(initialBillingDetails);
        setOriginalBillingAddress(initialBillingDetails);
        validateAndCallback(initialBillingDetails);

      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setIsInitialLoad(false);
      }
    };

    fetchUserDetails();
  }, [baseURL]);

  const validateAndCallback = (details: BillingAddress) => {
    const { attention, gst_no, address, city, state } = details;
    const isValid = !!attention && !!gst_no && !!address && !!city && !!state;
    onBillingDetailsChange(details, isValid);
  };

  const handleConfirm = async (updatedAddress: BillingAddress) => {
    setBillingAddress(updatedAddress);
    validateAndCallback(updatedAddress);
    setUpdateError(null);

    const token = retrieveToken();
    if (!token) return;

    const payload = {
      gst_no: updatedAddress.gst_no,
      billing_address: {
        address_id: updatedAddress.address_id,
        attention: updatedAddress.attention,
        address: updatedAddress.address,
        street2: updatedAddress.street2,
        city: updatedAddress.city,
        state: updatedAddress.state,
        state_code: updatedAddress.state_code,
        country: updatedAddress.country,
        country_code: updatedAddress.country_code,
        zip: updatedAddress.zip,
        phone: updatedAddress.phone,
        fax: updatedAddress.fax,
      }
    };

    try {
      const response = await axios.post(`${baseURL}/api/update-user-details`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200) {
        setOriginalBillingAddress(updatedAddress);
        setUpdateSuccess(true);
        setIsModalOpen(false);
        setTimeout(() => {
          setUpdateSuccess(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Error updating user details:', error);
      setUpdateError('Failed to update details. Please try again.');
      if (originalBillingAddress) {
        setBillingAddress(originalBillingAddress);
      }
    }
  };

  if (isInitialLoad) {
    return <div className="p-4 border rounded-lg mb-4 bg-gray-100 animate-pulse">Loading Billing Details...</div>;
  }

  return (
    <div className={`p-5 border rounded-lg mb-4 bg-[#FBFEFF] ${showError ? 'border-red-500' : ''}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Billing Details</h2>
        <button
          onClick={() => {
            setOriginalBillingAddress(billingAddress);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 text-gray-700 hover:text-black"
        >
          <Edit3 size={18} />
        </button>
      </div>
      <div className="text-gray-700 text-sm mt-2 items-center flex gap-2">
      <ShieldCheck  size={17}/>
        Please Verify your details before placing an order</div>

      <div className="mt-2 space-y-2 text-gray-700">
        <p><strong>Name:</strong> {billingAddress.attention || 'N/A'}</p>
        <p><strong>GST Number:</strong> {billingAddress.gst_no || 'N/A'}</p>
        <p><strong>Billing Address:</strong> {billingAddress.address || 'N/A'}</p>
        <p><strong>City:</strong> {billingAddress.city || 'N/A'}</p>
        <p><strong>State:</strong> {billingAddress.state || 'N/A'}</p>
      </div>
      {updateSuccess && <p className="text-green-500 text-sm mt-2">Details updated successfully!</p>}
      {showError && <p className="text-red-500 text-sm mt-2">Please complete your billing details before placing an order.</p>}
      <BillingAddressModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setUpdateError(null);
          if (originalBillingAddress) {
            setBillingAddress(originalBillingAddress);
          }
        }}
        onConfirm={handleConfirm}
        billingAddress={billingAddress}
        updateError={updateError}
      />
    </div>
  );
};

export default BillingDetails;