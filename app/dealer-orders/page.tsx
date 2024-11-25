"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Header from "@/app/components/header";
import { useRouter } from 'next/navigation';  // Corrected from next/navigation to next/router
import { decrypt } from '@/app/action/enc';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Select } from 'antd'; // Importing Select from Ant Design
import 'antd/dist/reset.css'; // Import Ant Design styles
import { CalendarDaysIcon } from 'lucide-react';


import { AiOutlineFileExcel, AiOutlineFilePdf } from 'react-icons/ai';

const { Option } = Select;

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

interface ShippingAddress {
  address: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  country_code: string;
  attention?: string;
  fax?: string;
  phone?: string;
  state_code?: string;
}


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

interface ShipmentOrder {
  delivery_date: string | null;
}

interface Package {
  carrier: string;
  tracking_number: string;
  shipment_date: string; 
  shipment_order: ShipmentOrder;
}

const OrderTable = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<ShippingAddress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLineItems, setSelectedLineItems] = useState<LineItem[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [startDate, setStartDate] = useState("");
  const [selectedDealer, setSelectedDealer] = useState('');
  const [dealerNames, setDealerNames] = useState<string[]>([]);
  const [endDate, setEndDate] = useState("");
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

  const getUserRole = () => {
    const token = retrieveToken();
    if (!token) return null;

    try {
      // Assuming the token is a JWT
      const decoded = JSON.parse(atob(token.split('.')[1]));
      return decoded.role; // Replace 'role' with the correct key in your token payload
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  };

  useEffect(() => {
    const token = retrieveToken();
    const userRole = getUserRole();

    if (!token || userRole !== "oem") {
      router.push('/'); // Redirect to home page if the role is not "oem"
      return;
    }


    if (!token) {
      router.push('/'); // Redirect to home page if the role is not "oem"
      return;
    }


    const fetchOrderStatus = async () => {
      try {
        const response = await axios.get(`${baseURL}/api/get-sales-orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
            brand: 'renault',
          },
        });
        
        const ordersData = response.data || [];
        setOrders(ordersData);
        setFilteredOrders(ordersData);
        
        // Extract unique dealer names from orders
        const uniqueDealerNames = Array.from(
          new Set(
            ordersData.map((order: { company_name?: string | null }) => order?.company_name?.trim())
          )
        )
          .filter((name): name is string => !!name) // Type guard to filter out falsy values
          .sort((a, b) => a.localeCompare(b)); // Sort alphabetically
        
        setDealerNames(uniqueDealerNames); // TypeScript now knows uniqueDealerNames is string[]
        
      } catch (error) {
        setError("Failed to fetch order status");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStatus();
  }, [router]);

  const filterOrders = (dealer: string, start: string, end: string) => {
    let filtered = [...orders];

    // Filter by dealer if selected
    if (dealer) {
      filtered = filtered.filter(order => order.company_name === dealer);
    }

    // Filter by date range if both dates are selected
    if (start && end) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.date);
        const startDateTime = new Date(start);
        const endDateTime = new Date(end);
        endDateTime.setHours(23, 59, 59, 999); // Include the entire end date
        
        return orderDate >= startDateTime && orderDate <= endDateTime;
      });
    }

    setFilteredOrders(filtered);
  };

 

 
  
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
        setSelectedShippingAddress(response.data.shipping_address); // Set shipping address

        
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

  const handleDealerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDealer(event.target.value);
    filterOrders(event.target.value, startDate, endDate);
  };

 

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === 'startDate') {
      setStartDate(value);
      filterOrders(selectedDealer, value, endDate);
    } else if (name === 'endDate') {
      setEndDate(value);
      filterOrders(selectedDealer, startDate, value);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FD]">
      <Header cartItemCount={0} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Dealer Orders</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-3">
        {/* Dealer Search Dropdown */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Search Dealer
          </label>
          <Select
            showSearch
            value={selectedDealer}
            onChange={(value) => {
              setSelectedDealer(value);
              filterOrders(value, startDate, endDate);
            }}
            placeholder="Search and select dealer"
            optionFilterProp="children"
            className="w-full"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={dealerNames.map(dealer => ({
              value: dealer,
              label: dealer
            }))}
          />
        </div>

        {/* Date Range Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
           Order Start Date
          </label>
          <div className="relative">
            <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              name="startDate"
              value={startDate}
              onChange={handleDateChange}
              className="pl-10 w-full p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Order End Date
          </label>
          <div className="relative">
            <CalendarDaysIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="date"
              name="endDate"
              value={endDate}
              onChange={handleDateChange}
              className="pl-10 w-full p-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
         {/* Search Bar */}
         <label className="block text-sm font-medium text-gray-700 mb-2">
           Search by Order Number
          </label>

         <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search..."
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div className="bg-white shadow sm:overflow-hidden overflow-scroll sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Dealer Name", "Order No", "Order Placed Date","Status"].map((header) => (
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
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <p className="text-gray-600">₹{order.cf_payment_details.split('-')[1]}</p>
                  </td> */}
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
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[5000]">
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
                        {/* <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                        <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax</th> */}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedLineItems.map((item, index) => (
                        <tr key={index}>
                          <td className="px-2 py-2 text-sm text-gray-800">{item.name}</td>
                          <td className="px-2 py-2 text-sm text-gray-600 text-start">{item.hsn_or_sac}</td>
                          <td className="px-2 py-2 text-sm text-gray-600 text-start">{item.quantity}</td>
                          {/* <td className="px-2 py-2 text-sm text-gray-600">₹{parseFloat(item.rate || '0').toFixed(2)}</td>
                          <td className="px-2 py-2 text-sm text-gray-800">₹{(parseFloat(item.rate || '0') * item.quantity).toFixed(2)}</td>
                          <td className="px-2 py-2 text-sm text-gray-800">{item.tax_percentage}%</td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600">No items to display.</p>
              )}

   {/* Shipping Address */}
   {selectedShippingAddress ? (
    <div className="mb-4">
        <h3 className="text-md font-semibold my-3">Shipping Address</h3>
        <p className="text-gray-700 text-sm">
            {selectedShippingAddress.attention || ''}, 
            {selectedShippingAddress.address}, 
            {selectedShippingAddress.street2 || ''}, 
            {selectedShippingAddress.city || ''}, 
            {selectedShippingAddress.state || ''}, 
            {selectedShippingAddress.zip}, 
            {selectedShippingAddress.country}
        </p>
    </div>
) : (
    <p className="text-gray-600">Shipping address not available.</p>
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
