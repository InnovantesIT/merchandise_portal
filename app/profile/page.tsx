"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '@/app/components/header';
import { useRouter } from 'next/navigation';
import { decrypt } from '@/app/action/enc';
import { Edit } from 'lucide-react';

type BillingAddress = {
  address_id?: string;
  attention?: string;
  address?: string;
  street2?: string;
  city?: string;
  state_code?: string;
  state?: string;
  zip?: string;
  country?: string;
  county?: string;
  country_code?: string;
  phone?: string;
  fax?: string;
};

function ProfilePage() {
  const [email, setEmail] = useState('');
  const [editableEmail, setEditableEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [gst, setGST] = useState('');
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({});
  const [loading, setLoading] = useState(true);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const router = useRouter();

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
    const token = retrieveToken();
    if (!token) {
      router.push('/');
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user-details`, {
          headers: {
            Authorization: `Bearer ${token}`,
            brand: 'renault',
          }
        });
        if (response.data) {
          const data = response.data;
          setName(data.company_name);
          setEmail(data.email);
          setMobile(data.phone);
          setGST(data.gst_no);
          setBillingAddress(data.billing_address || {});
        }
      } catch (error) {
        console.error('Failed to fetch user details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [router]);

  const formatAddress = () => {
    return `${billingAddress.address || ''}, ${billingAddress.city || ''}, ${billingAddress.state || ''} ${billingAddress.zip || ''}, ${billingAddress.country || ''}`;
  };

  const handleEditClick = () => {
    setEditableEmail(email);
    setIsEditing(true);
  };

  const handleEmailChange = (event: any) => {
    setEditableEmail(event.target.value);
  };

  const handleOtpChange = (event: any) => {
    setOtp(event.target.value);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowOtpInput(false);
    setOtp('');
  };

  const [serverOtp, setServerOtp] = useState('');

  const handleProceed = async () => {
    const token = retrieveToken();
    if (!token) return;
  
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/send-otp-email`,
        { email: editableEmail },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.otp) {
        setServerOtp(response.data.otp); // Store the OTP sent from the server
        setShowOtpInput(true);
      } else {
        alert('OTP not sent. Please try again.');
      }
    } catch (error) {
      console.error('Failed to send OTP:', error);
      alert('Error sending OTP, please check your connection and try again.');
    }
  };
  
  const handleSave = async () => {
    const token = retrieveToken();
    if (!token) return;
  
    // Compare the client-entered OTP with the server-sent OTP
    if (otp !== serverOtp) {
      alert('OTP verification failed, please enter the correct OTP.');
      return; // Stop the function if the OTPs do not match
    }
  
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/update-email`,
        { email: editableEmail, otp },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.data.updated===true) {
        setEmail(editableEmail);
        setIsEditing(false);
        setShowOtpInput(false);
        setOtp('');
        setServerOtp(''); // Clear the OTP from state
      } else {
        alert('Email update failed. Please try again.');
      }
    } catch (error) {
      console.error('Failed to update email:', error);
      alert('Error updating email, please check your connection and try again.');
    }
  };
  
  

  return (
    <main className='bg-gray-50 min-h-screen'>
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <Header cartItemCount={0} />
      <div className="flex flex-col items-center py-20">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
          <h1 className="text-3xl font-semibold mb-6">Profile</h1>
          <p className="mb-3"><strong>Company Name:</strong> {name}</p>
          <p className="mb-3"><strong>Address:</strong> {formatAddress()}</p>
          <p className="mb-3"><strong>GST Number:</strong> {gst}</p>
          <div className="flex items-center mb-3">
            <strong>Email:</strong> {email}
            <button onClick={handleEditClick} className="ml-2">
              <Edit className="text-blue-500 h-6 w-6 hover:text-blue-700 cursor-pointer" />
            </button>
          </div>
        </div>
      </div>
      
      {isEditing && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-2">Update Email</h2>
            {!showOtpInput ? (
              <>
                <label htmlFor="email" className="block mb-2 font-semibold">New Email:</label>
                <input
                  type="email"
                  id="email"
                  value={editableEmail}
                  onChange={handleEmailChange}
                  className="form-input px-4 py-2 border rounded-md w-full"
                />
                <div className="flex justify-end space-x-4 mt-4">
                  <button onClick={handleCancel} className="py-2 px-4 border rounded-md">Cancel</button>
                  <button onClick={handleProceed} className="py-2 px-4 border rounded-md bg-blue-500 text-white">Proceed</button>
                </div>
              </>
            ) : (
              <>
              <h3 className=' text-sm font-semibold'>OTP has been sent to your new entered email</h3>
                <label htmlFor="otp" className="block mb-2 font-semibold">Enter OTP:</label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={handleOtpChange}
                  className="form-input px-4 py-2 border rounded-md w-full"
                />
                <div className="flex justify-end space-x-4 mt-4">
                  <button onClick={handleCancel} className="py-2 px-4 border rounded-md">Cancel</button>
                  <button onClick={handleSave} className="py-2 px-4 border rounded-md bg-blue-500 text-white">Save</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default ProfilePage;
