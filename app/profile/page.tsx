"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '@/app/components/header';
import { useRouter } from 'next/navigation';
import { decrypt } from '@/app/action/enc';

function ProfilePage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [gst, setGST] = useState('');
  const [address, setAddress] = useState('');
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
          setEmail(data.email);
          setName(data.company_name);
          setMobile(data.mobile || '--');
          setGST(data.gst_no);
          setAddress(data.billing_address ? `${data.billing_address.street}, ${data.billing_address.city}, ${data.billing_address.state}, ${data.billing_address.zip}` : '');
        }

      } catch (error) {
        console.error('Failed to fetch user details:', error);
      }
    };

    fetchUserDetails();
  }, [router]);

  return (
    <main className='bg-gray-50 min-h-screen'>
      <Header cartItemCount={0} />
      <div className="flex flex-col items-center py-20">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
          <h1 className="text-3xl font-semibold mb-6">Profile </h1>
          <p className="mb-3"><strong>Email:</strong> {email}</p>
          <p className="mb-3"><strong>Name:</strong> {name}</p>
          <p className="mb-3"><strong>GST Number:</strong> {gst}</p>
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
