"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from "@/app/components/header";
import { useRouter } from 'next/navigation';
import { decrypt } from '@/app/action/enc';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { AiOutlineFileExcel, AiOutlineFilePdf } from 'react-icons/ai';

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
  const router = useRouter();

  const fetchOrderStatus = async () => {
    try {
      const response = await axios.get(baseURL + "/get-sales-order");
      console.log(response);
      setOrders(response.data.salesorders || []);
    } catch (error:any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('customer_id');
        localStorage.removeItem('first_name');
        localStorage.removeItem('username');
        
        router.push('/');
      }
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
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
    return `${day}${suffix(day)} ${new Intl.DateTimeFormat('en-GB', options).format(date)}`;
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(selectedLineItems.map(item => ({
      Product: item.name,
      Quantity: item.quantity,
      TotalPrice: parseFloat(item.rate || '0') * (item.quantity || 0)
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'OrderDetails');
    XLSX.writeFile(workbook, 'OrderDetails.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Order Details", 20, 10);
  
    // Define the columns including 'Price' and ensure correct alignment
    const columns = ["Product", "Quantity", "Price", "Total Price"];
    const data = selectedLineItems.map((item) => [
      item.name || 'N/A',
      item.quantity ?? 'N/A',
      `₹ ${(parseFloat(item.rate || '0')).toFixed(2)}`, // Price value
      `₹ ${(parseFloat(item.rate || '0') * (item.quantity || 0)).toFixed(2)}`, // Total price calculation
    ]);
  
    // Add table to the PDF
    autoTable(doc, {
      startY: 20,
      head: [columns],
      body: data,
      styles: {
        halign: 'center', // Center align by default for all cells
        valign: 'middle',
      },
      headStyles: {
        fillColor: [22, 160, 133], // Customize header color
      },
      columnStyles: {
        0: { halign: 'left' },    // Align Product column to the left
        1: { halign: 'center' },  // Align Quantity column to the center
        2: { halign: 'right' },   // Align Price column to the right
        3: { halign: 'right' },   // Align Total Price column to the right
      },
    });
  
    doc.save("OrderDetails.pdf");
  };
  
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Order Details</h2>
                <div className="flex space-x-4">
                  <AiOutlineFileExcel className="text-green-600 cursor-pointer" size={24} onClick={exportToExcel} />
                  <AiOutlineFilePdf className="text-red-600 cursor-pointer" size={24} onClick={exportToPDF} />
                </div>
              </div>
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
