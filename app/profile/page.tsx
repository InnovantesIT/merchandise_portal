"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '@/app/components/header';
import { useRouter } from 'next/navigation';
import { decrypt } from '@/app/action/enc';
import { motion } from 'framer-motion';
import { Edit, Mail, Phone, MapPin, CreditCard, Building } from 'lucide-react';
import UserProfileModal from '@/app/components/UserProfileModal';

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

interface UserProfile {
  name: string;
  mobile: string;
  gst: string;
  email: string;
  city: string;
  state: string;
  address: string;
}

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
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [gst, setGST] = useState('');
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const retrieveToken = () => {
    if (typeof window !== 'undefined') {
      const encryptedToken = localStorage.getItem('token');
      return encryptedToken ? decrypt(encryptedToken) : null;
    }
    return null;
  };

  const fetchUserDetails = async () => {
    const token = retrieveToken();
    if (!token) {
      router.push('/');
      return;
    }
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

  useEffect(() => {
    fetchUserDetails();
  }, [router]);

  const formatAddress = () =>
    [billingAddress.address, billingAddress.zip, billingAddress.country]
      .filter(Boolean)
      .join(', ');

  const handleUpdateProfile = async (profile: UserProfile) => {
    const token = retrieveToken();
    if (!token) return;

    const payload = {
      company_name: profile.name,
      phone: profile.mobile,
      gst_no: profile.gst,
      billing_address: {
        address: profile.address,
        city: profile.city,
        state: profile.state,
      }
    };

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/update-user-details`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh user details after update
      fetchUserDetails();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating user details:', error);
      alert('Failed to update profile. Please try again.');
    }
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold text-gray-800">My Profile</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
            >
              <Edit size={20} />
              <span>Edit Profile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FieldRow icon={<Building size={20} />} label="Company Name" value={name} />
            <FieldRow icon={<MapPin size={20} />} label="Address" value={formatAddress()} />
            <FieldRow icon={<MapPin size={20} />} label="City" value={billingAddress.city || '--'} />
            <FieldRow icon={<MapPin size={20} />} label="State" value={billingAddress.state || '--'} />
            <FieldRow icon={<CreditCard size={20} />} label="GST Number" value={gst} />
            {/* <div className="flex items-start gap-3"> */}
              {/* <div className="text-gray-500 mt-1"><Phone size={20} /></div>
              <div>
                <span className="block text-sm font-medium text-gray-600">Mobile</span>
                <a
                  href={`tel:${mobile}`}
                  className="text-black-600  font-sans"
                >
                  {mobile || '--'}
                </a>
              </div> */}
            {/* </div> */}
            {/* <div className="flex items-start gap-3">
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
            </div> */}
          </div>
        </motion.div>
      </div>

      <UserProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleUpdateProfile}
        userProfile={{ name, mobile, gst, email, city: billingAddress.city || '', state: billingAddress.state || '', address: billingAddress.address || '' }}
      />
    </main>
  );
}

export default ProfilePage;