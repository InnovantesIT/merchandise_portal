"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '@/app/components/header';
import { useRouter } from 'next/navigation';
import { decrypt } from '@/app/action/enc';

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
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [gst, setGST] = useState('');
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({});
  const [loading, setLoading] = useState(true);
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
          <p className="mb-3"><strong>Email:</strong> {email}</p>
        </div>
        <div className="text-center mt-6">
          <p>
            For any changes in this profile, please contact customer support at{' '}
            <a
              href="mailto:tech@toplineIndia.com"
              className="text-blue-500 underline"
            >
              tech@toplineIndia.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

export default ProfilePage;