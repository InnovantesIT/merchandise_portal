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
  company_name: string;
  salesorder_number: string;
  date: string;
  status: string;
  cf_payment_details: string;
}

interface LineItem {
  name: string;
  quantity: number;
  rate: string;
  hsn_or_sac?: string;
  tax_percentage?: string;
}

interface ShipmentOrder{
  delivery_date: string | null;
}

interface Package {
  carrier: string;
  tracking_number: string;
  shipment_date: string; 
  shipment_order:ShipmentOrder;

}

const OrderTable = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLineItems, setSelectedLineItems] = useState<LineItem[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null);
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

    const fetchOrderStatus = async () => {
      try {
        const response = await axios.get<Order[]>(`${baseURL}/api/get-sales-orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
            brand: 'renault',
          },
        });
        setOrders(response.data || []);
        setFilteredOrders(response.data || []); // Display all orders initially
      } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.clear();
          router.push('/');
        }
        setError("Failed to fetch order status");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStatus();
  }, [router]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    const lowercasedQuery = query.toLowerCase();
    setFilteredOrders(orders.filter(order => 
      order.salesorder_number.toLowerCase().includes(lowercasedQuery)
    ));
  };
  

  const handleViewDetails = async (salesOrderId: string) => {
    try {
      const token = retrieveToken();
      const response = await axios.get(`${baseURL}/api/get-sales-order-details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          id: salesOrderId,
        },
      });

      if (response.status === 200) {
        setSelectedLineItems(response.data.line_items || []);
        setPackages(response.data.packages || []);
        setIsModalOpen(true);
        setHighlightedOrderId(salesOrderId);
      } else {
        setError("Failed to fetch sales order details");
      }
    } catch (error) {
      setError("Failed to fetch sales order details");
    }
  };

  const onClose = () => {
    setIsModalOpen(false);
    setHighlightedOrderId(null);
    setSelectedLineItems([]);
    setPackages([]);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
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

    const columns = ["Product", "Quantity", "Price", "Total Price"];
    const data = selectedLineItems.map((item) => [
        item.name || 'N/A',
        item.quantity ?? 'N/A',
        `₹ ${(parseFloat(item.rate || '0')).toFixed(2)}`,
        `₹ ${(parseFloat(item.rate || '0') * (item.quantity || 0)).toFixed(2)}`,
    ]);

    const grandTotal = selectedLineItems.reduce((total, item) => {
        return total + (parseFloat(item.rate || '0') * (item.quantity || 0));
    }, 0);

    data.push(['Grand Total', '', '', `₹ ${grandTotal.toFixed(2)}`]);

    autoTable(doc, {
      startY: 20,
      head: [columns],
      body: data,
      styles: { halign: 'center', valign: 'middle' },
      headStyles: { fillColor: [22, 160, 133] },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
      },
      didParseCell: function(data) {
        if (data.row.index === data.table.body.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          if (data.column.index === 0) {
            data.cell.styles.halign = 'right';
          }
        }
      }
    });

    doc.save("OrderDetails.pdf");
  };

  return (
    <div className="min-h-screen bg-[#F6F8FD]">
      <Header cartItemCount={0} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Dealer Orders</h1>
         {/* Search Bar */}
         <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by Order Number"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="bg-white shadow  sm:overflow-hidden overflow-scroll sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Dealer Name", "Order No", "Order Placed Date","Amount", "Status"].map((header) => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
                <tr key={order.salesorder_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.company_name || 'Ambay Motors Pvt Ltd'}
                  </td>
                  <td onClick={() => handleViewDetails(order.salesorder_id)} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer ${highlightedOrderId === order.salesorder_id ? 'bg-yellow-200 font-bold' : 'hover:bg-gray-100'}`}>
                    {order.salesorder_number || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <p className="text-gray-600">₹{order.cf_payment_details.split('-')[1]}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${order.status === 'Dispatched' ? 'bg-blue-500 text-white' : 'bg-green-100 text-green-800'}`}>
    {order.status === 'draft' ? 'Order Placed' : order.status === 'fulfilled' ? 'Delivered' : order.status || 'N/A'}
  </span>
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white  p-6   rounded-lg shadow-lg sm:w-1/2 max-w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold mb-4">Order Details</h2>
                <button className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none" onClick={onClose}>✕</button>
              </div>

              {selectedLineItems.length > 0 ? (
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
                      {selectedLineItems.map((item, index) => (
                        <tr key={index}>
                          <td className="px-2 py-2 text-sm text-gray-800">{item.name}</td>
                          <td className="px-2 py-2 text-sm text-gray-600 text-center">{item.hsn_or_sac}</td>
                          <td className="px-2 py-2 text-sm text-gray-600 text-center">{item.quantity}</td>
                          <td className="px-2 py-2 text-sm text-gray-600">₹{parseFloat(item.rate || '0').toFixed(2)}</td>
                          <td className="px-2 py-2 text-sm text-gray-800">₹{(parseFloat(item.rate || '0') * item.quantity).toFixed(2)}</td>
                          <td className="px-2 py-2 text-sm text-gray-800">{item.tax_percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600">No items to display.</p>
              )}

              {packages.length > 0 ? (
                <div className="overflow-x-auto mt-4">
                  <h3 className="text-lg font-semibold mb-3">Shipped Packages</h3>
                  <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wider">Carrier</th>
                        <th className="px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wider">Tracking Number</th>
                        <th className="px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wider">Shipment Date</th>
                        <th className="px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wider">Delivery Date</th> 
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {packages.map((pkg, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-4 py-2 text-sm text-gray-800 text-center">{pkg.carrier}</td>
                          <td className="px-4 py-2 text-sm text-gray-800 text-center">{pkg.tracking_number || 'N/A'}</td>
                          <td className="px-4 py-2 text-sm text-gray-800 text-center">{pkg.shipment_date}</td>
                          <td className="px-4 py-2 text-sm text-gray-800 text-center">{pkg.shipment_order?.delivery_date || '--'}</td> {/* Delivery date */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600 mt-4 text-center">No shipped packages to display.</p>
              )}

              <div className="mt-4 flex justify-end">
                <button className="bg-black text-white py-2 px-4 rounded transition duration-300" onClick={onClose}>Close</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrderTable;
