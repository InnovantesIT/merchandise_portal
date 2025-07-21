"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '@/app/components/header';
import { useRouter } from 'next/navigation';
import { decrypt } from '@/app/action/enc';
import { motion } from 'framer-motion';
import { Edit, Mail, Phone, MapPin, CreditCard, Building } from 'lucide-react';

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

const FieldRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="text-gray-500 mt-1">{icon}</div>
    <div>
      <span className="block text-sm font-medium text-gray-600">{label}</span>
      <p className="text-gray-800 font-sans">{value || '--'}</p>
    </div>
  </div>
);

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
  const [serverOtp, setServerOtp] = useState('');
  const router = useRouter();

  const retrieveToken = () => {
    if (typeof window !== 'undefined') {
      const encryptedToken = localStorage.getItem('token');
      return encryptedToken ? decrypt(encryptedToken) : null;
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
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user-details`, {
          headers: { Authorization: `Bearer ${token}`, brand: 'renault' },
        });

        setName(data.company_name);
        setEmail(data.email);
        setMobile(data.phone);
        setGST(data.gst_no);
        setBillingAddress(data.billing_address || {});
      } catch (err) {
        console.error('Failed to fetch user details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [router]);

  const formatAddress = () =>
    [billingAddress.address, billingAddress.city, billingAddress.state, billingAddress.zip, billingAddress.country]
      .filter(Boolean)
      .join(', ');

  const handleEditClick = () => {
    setEditableEmail(email);
    setIsEditing(true);
  };

  const handleProceed = async () => {
    const token = retrieveToken();
    if (!token) return;

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/send-otp-email`,
        { email: editableEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.otp) {
        setServerOtp(data.otp);
        setShowOtpInput(true);
      } else {
        alert('OTP not sent, please try again.');
      }
    } catch (err) {
      console.error('Failed to send OTP:', err);
      alert('Error sending OTP, please check your connection.');
    }
  };

  const handleSave = async () => {
    const token = retrieveToken();
    if (!token) return;

    if (otp !== serverOtp) {
      alert('Invalid OTP, please check and retry.');
      return;
    }

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/update-email`,
        { email: editableEmail, otp },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.updated) {
        setEmail(editableEmail);
        setIsEditing(false);
        setShowOtpInput(false);
        setOtp('');
        setServerOtp('');
      } else {
        alert('Failed to update email, please try again.');
      }
    } catch (err) {
      console.error('Failed to update email:', err);
      alert('Error updating email, please check your connection.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowOtpInput(false);
    setOtp('');
  };

  return (
    <main className="bg-gray-50 min-h-screen">
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <Header cartItemCount={0} />

      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto"
        >
          <h1 className="text-3xl font-semibold mb-6 text-gray-800">My Profile</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FieldRow icon={<Building size={20} />} label="Company Name" value={name} />
            <FieldRow icon={<MapPin size={20} />} label="Address" value={formatAddress()} />
            <FieldRow icon={<CreditCard size={20} />} label="GST Number" value={gst} />
            <div className="flex items-start gap-3">
              <div className="text-gray-500 mt-1"><Phone size={20} /></div>
              <div>
                <span className="block text-sm font-medium text-gray-600">Mobile</span>
                <a 
                  href={`tel:${mobile}`} 
                  className="text-black-600  font-sans"
                >
                  {mobile || '--'}
                </a>
              </div>
            </div>           
            <div className="flex items-start gap-3">
              <div className="text-gray-500 mt-1"><Mail size={20} /></div>
              <div>
                <span className="block text-sm font-medium text-gray-600">Email</span>
                <a 
                  href={`mailto:${email}`} 
                  className="text-gray-800 font-sans"
                >
                  {email || '--'}
                </a>
              </div>
            </div>
          </div>

          {/* <button
            onClick={handleEditClick}
            className="mt-6 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
          >
            <Edit size={20} />
            <span>Edit Email</span>
          </button> */}
        </motion.div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Update Email</h2>

            {!showOtpInput ? (
              <>
                <label htmlFor="email" className="block mb-2 text-gray-700 font-medium">
                  New Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={editableEmail}
                  onChange={(e) => setEditableEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-6 flex justify-end gap-4">
                  <button onClick={handleCancel} className="px-4 py-2 border border-gray-300 rounded-lg">
                    Cancel
                  </button>
                  <button onClick={handleProceed} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Send OTP
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-green-600 mb-2">
                  OTP sent to {editableEmail}. Please check your inbox.
                </p>
                <label htmlFor="otp" className="block mb-2 text-gray-700 font-medium">
                  Enter OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-6 flex justify-end gap-4">
                  <button onClick={handleCancel} className="px-4 py-2 border border-gray-300 rounded-lg">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Save
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </main>
  );
}

export default ProfilePage;