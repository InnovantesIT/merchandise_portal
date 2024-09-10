"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from "@/app/components/header";
const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

interface Order {
  salesorder_id: string;
  dealer_name: string;
  salesorder_number: string;
  date: string;
  status: string;
  line_items?: LineItem[];
}

interface LineItem {
  name: string;
  quantity: number;
  rate: string;
}

const OrderTable = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLineItems, setSelectedLineItems] = useState<LineItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null);

  const fetchOrderStatus = async () => {
    try {
      const response = await axios.get(baseURL + "/get-sales-order");
      console.log(response);
      setOrders(response.data.salesorders || []);
    } catch (error) {
      setError("Failed to fetch order status");
      console.error("Error fetching order status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (salesOrderId: string) => {
    try {
      const response = await axios.get(`${baseURL}/api/sales-order-details`, {
        params: {
          salesorder_id: salesOrderId,
        },
      });

      if (response.status === 200) {
        setSelectedLineItems(response.data.salesorder?.line_items || []);
        setIsModalOpen(true);
        setHighlightedOrderId(salesOrderId);
      } else {
        setError("Failed to fetch sales order details");
      }
    } catch (error) {
      console.error("Error fetching sales order details:", error);
      setError("Failed to fetch sales order details");
    }
  };

  useEffect(() => {
    fetchOrderStatus();
  }, []);

  // Helper function to format date as "9th September 2024"
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'; // Handle missing date
  const date = new Date(dateString);
  const day = date.getDate();
  const suffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };

  // Corrected options object for Intl.DateTimeFormat
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
  return `${day}${suffix(day)} ${new Intl.DateTimeFormat('en-GB', options).format(date)}`;
};

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="min-h-screen bg-[#F6F8FD]">
      <Header cartItemCount={0} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Dealer Orders</h1>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Dealer Name", "Order No", "Order Placed Date", "Status"].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.salesorder_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.dealer_name || 'Ambay Motors Pvt Ltd'}
                  </td>
                  <td
                    onClick={() => handleViewDetails(order.salesorder_id)}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer ${
                      highlightedOrderId === order.salesorder_id
                        ? 'bg-yellow-200 font-bold'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {order.salesorder_number || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                        order.status === 'Dispatched'
                          ? 'bg-blue-500 text-white'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {order.status === 'draft' ? 'Order Placed' : order.status || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
              <h2 className="text-lg font-bold mb-4">Order Details</h2>
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedLineItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-100">
                      <td className="px-6 py-4 border-b border-gray-200 text-sm">
                        {item.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200 text-sm">
                        {item.quantity ?? 'N/A'}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200 text-sm">
                        ₹ {(parseFloat(item.rate || '0') * (item.quantity || 0)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={() => setIsModalOpen(false)}
                className="mt-4 px-4 py-2 bg-black text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderTable;
