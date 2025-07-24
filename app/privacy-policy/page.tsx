'use client'
import React from 'react';
import Header from "@/app/components/header";
import Footer from '@/app/components/footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Header cartItemCount={0} />
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6 text-gray-700">Privacy Policy</h1>
        <p className="mb-6">
          At <strong>Topline Print Media Pvt. Ltd.</strong>, we are committed to protecting your privacy. This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from{' '}
          <a 
            href="https://www.toplineindia.com" 
            className="text-gray-600 underline"
            target="_blank" 
            rel="noopener noreferrer"
          >
            www.toplineindia.com
          </a>
          .
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-3 text-gray-700">Information We Collect</h2>
        <h3 className="text-lg font-semibold mt-6 mb-2">Personal Information</h3>
        <ul className="list-disc ml-6 mb-4">
          <li>Name</li>
          <li>Billing and Shipping Address</li>
          <li>Email Address</li>
          <li>Phone Number</li>
          <li>Payment Details (processed securely)</li>
          <li>Order and Transaction History</li>
        </ul>
        <h3 className="text-lg font-semibold mt-6 mb-2">Automatic Data Collection</h3>
        <ul className="list-disc ml-6 mb-4">
          <li>IP address</li>
          <li>Device type and browser</li>
          <li>Pages visited and time spent</li>
          <li>Referring website</li>
          <li>Cookies and tracking technologies</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-3 text-gray-700">How We Use Your Information</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Process and fulfill your orders</li>
          <li>Send order confirmations, invoices, and updates</li>
          <li>Respond to customer service requests</li>
          <li>Improve our website and user experience</li>
          <li>Send promotional emails or offers (you can opt out anytime)</li>
          <li>Prevent fraud or misuse of our platform</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-3 text-gray-700">Sharing Your Information</h2>
        <p className="mb-4">
          We do not sell your personal data. We may share it with:
        </p>
        <ul className="list-disc ml-6 mb-4">
          <li>Service providers such as payment gateways, logistics partners, hosting providers, and marketing platforms</li>
          <li>Legal authorities, if required by law or for fraud prevention</li>
          <li>In the event of a merger, acquisition, or asset sale</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-3 text-gray-700">Cookies and Tracking</h2>
        <p className="mb-4">We use cookies and similar technologies to:</p>
        <ul className="list-disc ml-6 mb-4">
          <li>Maintain your session</li>
          <li>Analyze traffic and usage</li>
          <li>Personalize your shopping experience</li>
        </ul>
        <p className="text-sm mb-6">
          <strong>Note:</strong> You can control cookie settings through your browser preferences.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-3 text-gray-700">Data Security</h2>
        <p className="mb-6">
          We implement appropriate security measures such as <strong>SSL encryption</strong> and <strong>access controls</strong> to protect your personal data. However, no system is 100% secure, and we cannot guarantee absolute security.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-3 text-gray-700">Your Rights</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Access, update, or delete your personal information</li>
          <li>Opt out of marketing emails</li>
          <li>Withdraw consent, where applicable</li>
        </ul>
        <p className="mb-6">
          To exercise any of these rights, please contact us at&nbsp;
          <a href="mailto:mail@toplineindia.com" className="text-gray-600 underline">
            mail@toplineindia.com
          </a>.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-3 text-gray-700">Children&apos;s Privacy</h2>
        <p className="mb-6">
          Our site is not intended for individuals under the age of <strong>18</strong>. We do not knowingly collect data from minors.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-3 text-gray-700">Changes to This Policy</h2>
        <p className="mb-6">
          We may update this Privacy Policy occasionally. Changes will be posted on this page with an updated revision date.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-3 text-gray-700">Contact Us</h2>
        <p className="mb-2">
          If you have any questions about this Privacy Policy, please contact us:
        </p>
        <div className="mb-6">
          <div>Topline Print Media Pvt. Ltd.</div>
          <div>
            Email: <a href="mailto:mail@toplineindia.com" className="text-gray-600 underline">mail@toplineindia.com</a>
          </div>
          <div>
            Website: <a href="https://www.toplineindia.com" className="text-gray-600 underline" target="_blank" rel="noopener noreferrer">www.toplineindia.com</a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;