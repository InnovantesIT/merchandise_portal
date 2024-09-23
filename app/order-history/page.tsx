"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Head from "next/head";
import { useRouter } from 'next/navigation';
import Header from '@/app/components/header';
import { motion } from "framer-motion";
import { History } from 'lucide-react';
import { decrypt } from '@/app/action/enc';

const OrderDetailsModal = ({ isOpen, onClose, line_items = [] }: any) => {
  if (!isOpen) return null;


  return (
  
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-lg shadow-lg p-4 relative overflow-scroll max-w-full md:max-w-3xl mx-2 md:mx-0">
    <h2 className="text-lg font-semibold mb-4">Order Details</h2>

    <button
      className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none"
      onClick={onClose}
    >
      ✕
    </button>

    {Array.isArray(line_items) && line_items.length > 0 ? (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HSN</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
              <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax</th>


            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {line_items.map((item, index) => (
              <tr key={index}>
                <td className="px-2 py-2 text-sm text-gray-800 max-w-full overflow-hidden overflow-ellipsis whitespace-nowrap">
                  {item.name}
                </td>
                <td className="px-2 py-2 text-sm text-gray-600 text-center">{item.hsn_or_sac}</td>
                <td className="px-2 py-2 text-sm text-gray-600 text-center">{item.quantity}</td>
                <td className="px-2 py-2 text-sm text-gray-600">{parseFloat(item.rate).toFixed(2)}</td>
                <td className="px-2 py-2 text-sm text-gray-800"> {(parseFloat(item.rate) * item.quantity).toFixed(2)}</td>
                <td className="px-2 py-2 text-sm text-gray-800">{(parseFloat(item.tax_percentage))}%</td>
              

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="text-gray-600">No items to display.</p>
    )}

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
  const [orders, setOrders] = useState<any[]>([]); // Ensure orders is initialized as an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLineItems, setSelectedLineItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter(); 
  const itemsPerPage = 10;
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
    const token = retrieveToken();
    if (!token) {
      router.push('/');
      return;
    }

  const fetchOrderStatus = async () => {
    try {
      
      const response = await axios.get(baseURL + "/api/get-sales-orders",
        {
      headers: {
        Authorization: `Bearer ${token}`,
        brand: 'renault',
      },
    })
      setOrders(response.data);
    } catch (error) {
      setError("Failed to fetch order status");
      console.error("Error fetching order status:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchOrderStatus();
  }, [baseURL, router]);

  useEffect(() => {
    const token = retrieveToken();
    if (!token) {
      router.push('/');
      return;
    }
  }, [router]);

  const handleViewDetails = async (salesorder_id: any) => {
    try {
      const token = retrieveToken(); // Retrieve token here if needed
      if (!token) {
        setError("Authorization token not found");
        return;
      }

      const response = await axios.get(`${baseURL}/api/get-sales-order-details`, {
        params: {
          id:salesorder_id
        },
        headers: {
          Authorization: `Bearer ${token}`,
          brand: 'renault',
        },
      });

      if (response.status === 200) {
        setSelectedLineItems(response.data.line_items);
        setIsModalOpen(true);
      } else {
        setError("Failed to fetch sales order details");
      }
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Clear user-related storage and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('customer_id');
        localStorage.removeItem('first_name');
        localStorage.removeItem('username');
        
        router.push('/');
      } else {
        console.error("Error fetching sales order details:", error);
        setError("Failed to fetch sales order details");
      }
    }
  };


  const renderProgressLine = (status: any) => {
    const steps = ["Order Placed", "Order Confirmation", "Dispatched"];

    const statusIndexMap: { [key: string]: number } = {
      draft: 0,
      confirmed: 1,
      fulfilled: 2,
    };

    const statusIndex = statusIndexMap[status] || 0;

    return (
      <div className="flex flex-col items-end w-full mt-4 md:mt-0">
        <div className="flex items-center justify-between w-full md:w-3/4 relative">
          <div className="absolute top-1/4 left-6 right-6 -translate-y-1/3">
            <div className="h-0.5 bg-gray-200 w-full" />
            <div
              className="absolute left-0 top-0 h-0.5 bg-green-500 transition-all duration-500 ease-in-out"
              style={{
                width: `${(statusIndex / (steps.length - 1)) * 100}%`,
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
                  className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full ${
                    index <= statusIndex ? "bg-green-500" : "bg-gray-200"
                  }`}
                >
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full" />
                </motion.div>
                <span className="mt-2 text-xs md:text-sm font-sans font-medium text-gray-700 text-center">
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();

    const getOrdinalSuffix = (n: any) => {
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = Array.isArray(orders) ? orders.slice(indexOfFirstItem, indexOfLastItem) : [];
  const totalPages = Math.ceil(Array.isArray(orders) ? orders.length / itemsPerPage : 0);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
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
        <div className='py-8 md:py-12 mx-auto max-w-6xl px-4 md:px-6 lg:px-8'>
          <div className="flex gap-3">
            <History strokeWidth={1.25} />
            <h1 className="text-xl font-semibold mb-8 md:mb-12 text-gray-800">Order History</h1>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              {currentOrders.map((order: any, index: any) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg mb-6 md:mb-8 p-4 md:p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6">
                    <div className="w-full md:w-auto mb-2 md:mb-0">
                      <p className="text-gray-500 text-sm">Order Number</p>
                      <h3 className="text-xl font-semibold text-gray-800 whitespace-nowrap">{order.salesorder_number}</h3>
                    </div>
                    {renderProgressLine(order.order_status)}
                  </div>
                  <p className="text-gray-600 mb-2 ">Order Date: {formatDate(order.date)}</p>
                  <p className="text-gray-600 mb-2 ">
Amount: ₹{order.cf_payment_details.split('-')[1]}

</p>
<p className="text-gray-600 mb-2 ">
  Payment Mode: {order.cf_payment_details.split('-')[0]}
</p>
                  <p className="text-gray-600 mb-2 "> Reference Number: {order.cf_payment_details.split('-').pop()}</p>
                 

                <button
                    className="bg-black text-white py-2 px-4 rounded"
                    onClick={() => handleViewDetails(order.salesorder_id)}
                  >
                    View Details
                  </button>
                </motion.div>
              ))}

              {/* Pagination Controls */}
              <div className="flex justify-center mt-6">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    className={`mx-1 px-3 py-1 rounded ${index + 1 === currentPage ? "bg-black text-white" : "bg-gray-200"}`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </>
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
