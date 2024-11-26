"use client"
import React, { useEffect, useState } from "react";
import axios from "axios";
import Head from "next/head";
import { useRouter } from 'next/navigation';
import Header from '@/app/components/header';
import { motion } from "framer-motion";
import { History, Calendar, Search } from 'lucide-react';
import { decrypt } from '@/app/action/enc';
import Loader from '@/app/components/loader';

interface Order {
  salesorder_id: string;
  salesorder_number: string;
  status: 'draft' | 'confirmed' | 'shipped'| 'fulfilled';
  date: string;
  cf_payment_details: string;
}

interface LineItem {
  name: string;
  hsn_or_sac: string;
  quantity: number;
  rate: string;
  tax_percentage: string;
}

interface ShipmentOrder{
  delivery_date: string | null;
}

interface Package {
  carrier: string;
  tracking_number: string | null;
  shipment_date: string;
  shipment_order:ShipmentOrder;

}

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

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  line_items: LineItem[];
  packages: Package[];
  shippingAddress: ShippingAddress | null;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps & { shipmentOrder: { delivery_date: string } | null }> = ({
  isOpen,
  onClose,
  line_items = [],
  packages = [],
  shipmentOrder,
  shippingAddress,
  

}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[5000]">
      <div className="bg-white rounded-lg sm:p-8 p-4 relative sm:overflow-hidden overflow-scroll max-w-full mx-2 md:mx-0">
        <h2 className="text-lg font-semibold mb-4">Order Details</h2>

        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none"
          onClick={onClose}
        >
          ✕
        </button>




        {/* Line items table */}
        {line_items.length > 0 ? (
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
                {line_items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-2 py-2 text-sm text-gray-800">{item.name}</td>
                    <td className="px-2 py-2 text-sm text-gray-600 text-start">{item.hsn_or_sac}</td>
                    <td className="px-2 py-2 text-sm text-gray-600 text-center">{item.quantity}</td>
                    {/* <td className="px-2 py-2 text-sm text-gray-600">{parseFloat(item.rate).toFixed(2)}</td>
                    <td className="px-2 py-2 text-sm text-gray-800">{(parseFloat(item.rate) * item.quantity).toFixed(2)}</td>
                    <td className="px-2 py-2 text-sm text-gray-800">{(parseFloat(item.tax_percentage))}%</td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">No items to display.</p>
        )}
        {/* Shipping Address */}
{shippingAddress ? (
  <div className="mb-4">
    <h3 className="text-md font-semibold my-3">Shipping Address</h3>
    <p className="text-gray-700 text-sm">
       {shippingAddress.attention || ''}, 
      {shippingAddress.address}, 
      {shippingAddress.street2 || ''}, 
      {shippingAddress.city || ''}, 
      {shippingAddress.state || ''}, 
      {shippingAddress.zip}, 
      {shippingAddress.country}
    </p>
  </div>
) : (
  <p className="text-gray-600">Shipping address not available.</p>
)}

        {/* Packages table */}
        {packages.length > 0 ? (
          <div className="overflow-x-auto mt-4">
            <h3 className="text-lg font-semibold mb-3">Shipped Packages</h3>
            <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wider">Carrier</th>
                  <th className="px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wider">Tracking Number</th>
                  <th className="px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wider">Shipment Date</th>
                  <th className="px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wider">Delivery Date</th> {/* New column */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {packages.map((pkg, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-4 py-2 text-sm text-gray-800 text-center">{pkg.carrier}</td>
                    <td className="px-4 py-2 text-sm text-gray-800 text-center">{pkg.tracking_number || '--'}</td>
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


const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLineItems, setSelectedLineItems] = useState<LineItem[]>([]);
  const [shipmentDetails, setShipmentDetails] = useState<Package[]>([]);
  const [shipmentOrder, setShipmentOrder] = useState<{ delivery_date: string } | null>(null);
  const [deliveryDetails,setDeliveryDetails]=useState<Package[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<ShippingAddress | null>(null);
  const router = useRouter();
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
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    const lowercasedQuery = query.toLowerCase();
    setFilteredOrders(orders.filter(order =>
      order.salesorder_number.toLowerCase().includes(lowercasedQuery)
    ));
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
        setOrders(response.data);
        setFilteredOrders(response.data);
      } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.clear();
          router.push('/');
        } else {
          console.error("Error fetching sales order details:", error);
          setError("Failed to fetch sales order details");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStatus();
  }, [baseURL, router]);

  const handleViewDetails = async (salesorder_id: string) => {
    try {
      const token = retrieveToken();
      if (!token) {
        setError("Authorization token not found");
        return;
      }
  
      const response = await axios.get<{ line_items: LineItem[], packages: Package[], shipment_order: { delivery_date: string }, shipping_address: ShippingAddress;}>(`${baseURL}/api/get-sales-order-details`, {
        params: {
          id: salesorder_id,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          brand: 'renault',
        },
      });
  
      if (response.status === 200) {
        setSelectedLineItems(response.data.line_items);
        setShipmentOrder(response.data.shipment_order);
        setShipmentDetails(response.data.packages);
        setSelectedShippingAddress(response.data.shipping_address); // Set shipping address

        setIsModalOpen(true);
      } else {
        setError("Failed to fetch sales order details");
      }
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.clear();
        router.push('/');
      } else {
        console.error("Error fetching sales order details:", error);
        setError("Failed to fetch sales order details");
      }
    }
  };
  


 const renderProgressLine = (status: Order['status']) => {
  const steps = ["Order Placed", "Order Confirmation", "Dispatched", "Order Delivered"];
  const statusIndexMap: Record<Order['status'], number> = {
    draft: 0,
    confirmed: 1,
    shipped: 2,
    fulfilled: 3, // Added delivered status
  };
  const statusIndex = statusIndexMap[status] || 0;



    return (
      <div className="flex flex-col items-end w-full mt-4 md:mt-0">
        <div className="flex items-center justify-between w-full md:w-3/4 relative">
          <div className="absolute top-1/4 left-6 right-9 -translate-y-1/3">
            <div className="h-0.5 bg-gray-200 w-full" />
            <div
              className="absolute left-0 top-0 h-0.5 bg-green-500 transition-all duration-500 ease-in-out"
              style={{ width: `${(statusIndex / (steps.length - 1)) * 100}%` }}
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();

    const getOrdinalSuffix = (n: number) => {
      if (n > 3 && n < 21) return 'th';
      switch (n % 10) {
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

    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
  };

  const handleDateFilter = () => {
    const filtered = orders.filter((order) => {
      const orderDate = new Date(order.date);
      const from = fromDate ? new Date(fromDate) : new Date(0);
      const to = toDate ? new Date(toDate) : new Date();
      return orderDate >= from && orderDate <= to;
    });
    setFilteredOrders(filtered);
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
        <div className="py-8 md:py-12 mx-auto max-w-6xl px-4 md:px-6 lg:px-8">
          <div className="flex flex-col sm:justify-start justify-between items-start  mb-8">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <History strokeWidth={1.25} />
              <h1 className="text-2xl font-semibold text-gray-800">Order History</h1>
            </div>
            <div className="w-full max-w-3xl mx-auto mt-4">
              <div className="flex justify-between">
  <label className="text-sm font-semibold text-gray-700 mb-2 sm:block hidden">
    Search by Order Number
  </label>
  <label className=" sm:block hidden text-sm font-semibold text-gray-700 mb-2 mr-56 ">
    Filter by order Date
  </label>
  </div>
    <div className="flex flex-col md:flex-row items-center md:space-x-4 space-y-4 md:space-y-0">
    <div className="w-full space-y-2 md:flex md:items-center md:space-x-4">
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Enter order number"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300"
      />
      <div className="flex items-center space-x-2">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => {
            setFromDate(e.target.value);
            const filtered = orders.filter((order) => {
              const orderDate = new Date(order.date);
              const from = e.target.value ? new Date(e.target.value) : new Date(0);
              const to = toDate ? new Date(toDate) : new Date();
              return (
                orderDate >= from && 
                orderDate <= to && 
                order.salesorder_number.toLowerCase().includes(searchQuery.toLowerCase())
              );
            });
            setFilteredOrders(filtered);
          }}
          max={toDate || undefined}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 mb-3"
        />
        <span className="text-gray-500 mb-2">to</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => {
            setToDate(e.target.value);
            const filtered = orders.filter((order) => {
              const orderDate = new Date(order.date);
              const from = fromDate ? new Date(fromDate) : new Date(0);
              const to = e.target.value ? new Date(e.target.value) : new Date();
              return (
                orderDate >= from && 
                orderDate <= to && 
                order.salesorder_number.toLowerCase().includes(searchQuery.toLowerCase())
              );
            });
            setFilteredOrders(filtered);
          }}
          min={fromDate || undefined}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition-all duration-300 mb-3"
        />
      </div>
    </div>
  </div>
</div>
</div>

          {loading ? (
            <div className="flex items-center justify-center h-full mx-auto">
              <Loader />
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
              {filteredOrders.map((order, index) => (
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
                    {renderProgressLine(order.status)}
                  </div>
                  <p className="text-gray-600 mb-2">Order Date: {formatDate(order.date)}</p>
                  {/* <p className="text-gray-600 mb-2">Amount: ₹{order.cf_payment_details.split('-')[1]}</p>
                  <p className="text-gray-600 mb-2">Payment Mode: {order.cf_payment_details.split('-')[0]}</p>
                  <p className="text-gray-600 mb-2">Reference Number: {order.cf_payment_details.split('-').pop()}</p> */}
                  <button
                    className="bg-black text-white py-2 px-4 rounded"
                    onClick={() => handleViewDetails(order.salesorder_id)}
                  >
                    View Details
                  </button>
                </motion.div>
              ))}
            </>
          )}
        </div>
      </main>

      {/* Order Details Modal */}
      <OrderDetailsModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  line_items={selectedLineItems}
  packages={shipmentDetails}
  shipmentOrder={shipmentOrder}
  shippingAddress={selectedShippingAddress}
/>


    </div>
  );
};

export default OrderHistory;