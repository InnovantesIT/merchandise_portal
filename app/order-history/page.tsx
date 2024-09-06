"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Head from "next/head";
import Header from '@/app/components/header';
import { motion } from "framer-motion";
import { History } from 'lucide-react';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrderStatus = async () => {
    try {
      const response = await axios.get("http://localhost:3307/get-sales-order"); // Replace with your API endpoint
      
      console.log(response);
      setOrders(response.data.details.salesorders); // Assume the API returns an array of orders
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

  const renderProgressLine = (status:any) => {
    const steps = ["Order Placed", "Order Confirmation", "Dispatched"];

    const statusIndex=0;

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

  const pageTitle = "Order History";

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>{pageTitle}</title>
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
            <h1 className="text-xl font-semibold mb-8 sm:mb-12 text-gray-800">{pageTitle}</h1>
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
                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 whitespace-nowrap">{order.salesorder_number}</h3>
                  </div>
                  {renderProgressLine(order.status)}
                </div>
                <p className="text-gray-600 mb-4 sm:mb-6">Order Date: {order.date}</p>
                {order.items ? (
                  order.items.map((item:any, itemIndex:any) => (
                    <div
                      key={itemIndex}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 sm:mt-6 bg-gray-50 p-4 rounded-lg"
                    >
                      <div className="flex items-center mb-4 sm:mb-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover mr-4 sm:mr-6 rounded-md shadow-md"
                        />
                        <div>
                          <h4 className="font-semibold text-base sm:text-lg text-gray-800">{item.name}</h4>
                          <p className="text-gray-600">
                            ₹ {item.rate} x {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-lg sm:text-xl text-gray-800">
                          ₹ {(parseFloat(item.rate) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col sm:flex-row justify-between mt-4 sm:mt-6 bg-gray-50 p-4 rounded-lg">
                   
                  </div>
                )}
                {order.items && (
                  <div className="flex justify-between mt-6 sm:mt-8 pt-4 border-t border-gray-200">
                    <p className="text-base sm:text-lg font-semibold text-gray-600">Item Subtotal:</p>
                    <p className="text-xl sm:text-2xl font-semibold text-gray-800">
                      ₹{" "}
                      {order.items
                        .reduce(
                          (total:any, item:any) =>
                            total + parseFloat(item.rate) * item.quantity,
                          
                        )
                        .toFixed(2)}
                    </p>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderHistory;
