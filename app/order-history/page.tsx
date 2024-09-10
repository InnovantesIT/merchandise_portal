"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Head from "next/head";
import Header from '@/app/components/header';
import { motion } from "framer-motion";
import { History } from 'lucide-react';

// Modal component to display order items
// Updated OrderDetailsModal component to beautify UI and add item subtotal
const OrderDetailsModal = ({ isOpen, onClose, line_items = [] }:any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <h2 className="text-lg font-semibold mb-4">Order Details</h2>
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none"
          onClick={onClose}
        >
          ✕
        </button>
        {Array.isArray(line_items) && line_items.map((item, index) => (
          <div key={index} className="flex items-start mb-4 space-x-4 border-b pb-4 last:border-none">
           
            <div className="flex-1">
              <h4 className="font-semibold text-base text-gray-800">{item.name}</h4>
              <p className="text-gray-600">Quantity: {item.quantity}</p>
              <p className="text-gray-600">Rate: ₹ {parseFloat(item.rate).toFixed(2)}</p>
              <p className="font-semibold text-gray-800">
                Subtotal: ₹ {(parseFloat(item.rate) * item.quantity).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
        <div className="mt-4 flex justify-end">
          <button
            className="bg-black text-white py-2 px-4 rounded transition duration-300"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLineItems, setSelectedLineItems] = useState([]);
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

  const fetchOrderStatus = async () => {
    try {
      const response = await axios.get(baseURL + "/get-sales-order");
      console.log(response);
      setOrders(response.data.salesorders); // Ensure this matches your API structure
    } catch (error) {
      setError("Failed to fetch order status");
      console.error("Error fetching order status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderStatus();
  }, []);

  const handleViewDetails = async (salesOrderId:any) => {
   
    try {
      const response = await axios.get(`${baseURL}/api/sales-order-details`,{
        params: {
          salesorder_id:salesOrderId
      }});
      
      if (response.status === 200) {
        setSelectedLineItems(response.data.salesorder.line_items); 
        setIsModalOpen(true);
      } else {
        setError("Failed to fetch sales order details");
      }
    } catch (error) {
      console.error("Error fetching sales order details:", error);
      setError("Failed to fetch sales order details");
    }
  };

  const renderProgressLine = (status:any) => {
    const steps = ["Order Placed", "Order Confirmation", "Dispatched"];
    const statusIndex = 0; // Replace with logic to calculate the current status index

    return (
      <div className="flex flex-col items-end w-full mt-4 sm:mt-0">
        <div className="flex items-center justify-between w-full sm:w-1/2 relative mr-0 sm:mr-5">
          <div className="absolute top-1/4 left-6 right-6 -translate-y-1/3">
            <div className="h-0.5 bg-gray-200 w-full" />
            <div 
              className="absolute left-0 top-0 h-0.5 bg-green-500 transition-all duration-500 ease-in-out"
              style={{
                width: `${(statusIndex / (steps.length - 1)) * 100}%`
              }}
            />
          </div>

          <div className="flex justify-between w-full relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full ${
                    index <= statusIndex ? "bg-green-500" : "bg-gray-200"
                  }`}
                >
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full" />
                </motion.div>
                <span className="mt-2 text-xs sm:text-sm font-sans font-medium text-gray-700 text-center">
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const formatDate = (dateString:any) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();

    const getOrdinalSuffix = (n:any) => {
      if (n > 3 && n < 21) return 'th'; 
      switch (n % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };

    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Order History</title>
        <meta
          name="description"
          content="View and manage your past orders in your order history. Check details, status, price and more."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-9xl mx-auto font-sans">
        <Header cartItemCount={0} />
        <div className='py-8 sm:py-12 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8'>
          <div className="flex gap-3">
            <History strokeWidth={1.25} />
            <h1 className="text-xl font-semibold mb-8 sm:mb-12 text-gray-800">Order History</h1>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            orders.map((order:any, index:any) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg mb-6 sm:mb-8 p-4 sm:p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
                  <div className="w-full sm:w-auto mb-4 sm:mb-0">
                    <p className="text-gray-500 text-sm">Order Number</p>
                    <h3 className="text-xl  font-semibold text-gray-800 whitespace-nowrap">{order.salesorder_number}</h3>
                  </div>
                  {renderProgressLine(order.status)}
                </div>
                <p className="text-gray-600 mb-4 sm:mb-6">Order Date: {formatDate(order.date)}</p>
                <button
                  className="bg-black text-white py-2 px-4 rounded"
                  onClick={() => handleViewDetails(order.salesorder_id)} 
                >
                  View Details
                </button>
              </motion.div>
            ))
          )}
        </div>
      </main>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        line_items={selectedLineItems}
      />
    </div>
  );
};

export default OrderHistory;
