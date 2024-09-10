"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Plus, Minus, Edit3, CreditCard } from 'lucide-react';
import { BsHandbag } from 'react-icons/bs';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/app/components/header';
import { useCart } from '@/app/context/cartcontext';
import Head from 'next/head';
import CustomDropdown from '@/app/components/customdropdown';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation

interface Product {
  id: number; 
  name: string;
  rate: number;
  qty: number; 
  image: string;
  item_id: string;
  price_per_unit: string;
  total_price: string;         
  customer_id:string;
}

const CartPage: React.FC = () => {
  const [isPaymentPlaced, setIsPaymentPlaced] = useState(false);
  const [canEditItems, setCanEditItems] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState({
    mode: '',
    reference: '',
    date: '',
  });
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string>('');
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter(); // Initialize router for redirection

  // Check for user authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to home page if no token is found
      router.push('/');
      return; // Exit early to prevent further execution
    }

    // Fetch customer ID from local storage
    const storedCustomerId = localStorage.getItem('customer_id');
    if (storedCustomerId) {
      setCustomerId(storedCustomerId);
    }

    // Fetch cart items when the component mounts
    fetchCartItems();
  }, [router]);

  const fetchCartItems = async () => {
    try {
      const response = await axios.get(baseURL + '/api/cart', {
        params: { customer_id: customerId }
      });
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };
  
  const handleUpdateQuantity = async (product: Product, change: number) => {
    const newQuantity = product.qty + change;
    if (newQuantity > 0) {
      try {
        const response = await axios.put(baseURL + `/api/cart/${product.id}`, {
          qty: newQuantity,
          customer_id: customerId,
        });
        if (response.status === 200) {
          setCartItems((prevItems) =>
            prevItems.map((item) =>
              item.id === product.id ? { ...item, qty: newQuantity } : item
            )
          );
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
        setErrorMessage('Failed to update item quantity.');
      }
    } else {
      handleRemoveFromCart(product);
    }
  };

  const handleRemoveFromCart = async (product: Product) => {
    try {
      const response = await axios.delete(baseURL + `/api/cart`, { 
        data: { id: product.id, customer_id: customerId } 
      });
      if (response.status === 200) {
        setCartItems(cartItems.filter((item) => item.id !== product.id));
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      setErrorMessage('Failed to remove item from cart.');
    }
  };

  const handlePaymentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    if (!paymentDetails.mode || !paymentDetails.reference || !paymentDetails.date) {
      setErrorMessage('All payment details are required.');
      return;
    }
  
    const timestamp = new Date().toISOString().replace(/[-:.T]/g, '').slice(0, 14);
    const salesOrderNumber = `SO-${paymentDetails.mode}-${timestamp}`;
  
    const salesOrderData = {
      customer_id: customerId,
      salesorder_number: salesOrderNumber,
      line_items: cartItems.map((item) => ({
        item_id: item.item_id,
        name: item.name,
        quantity: item.qty,
        rate: parseFloat(item.price_per_unit),
      })),
      reference_number: paymentDetails.reference,
      date: paymentDetails.date,
      custom_fields: [
        {
          label: "Payment Mode", 
          value: paymentDetails.mode,
        },
      ],
    };
  
    if (salesOrderData.line_items.length === 0) {
      setErrorMessage('No items in the cart to place an order.');
      return;
    }
  
    try {
      const response = await axios.post(baseURL + '/create-sales-order', salesOrderData);
  
      if (response.status === 200 || response.status === 201) {
        setIsPaymentPlaced(true);
        setCanEditItems(false);
        setErrorMessage(null);
  
        try {
          await Promise.all(
            cartItems.map(async (item) => {
              try {
                await DeleteFromCart(item);
              } catch (deleteError) {
                console.error(`Error removing item ${item.id} from cart:`, deleteError);
                throw new Error(`Failed to remove item ${item.name} from cart.`);
              }
            })
          );
          setCartItems([]); // Clear cart after all items are removed
        } catch (deleteAllError) {
          console.error('Error clearing cart items:', deleteAllError);
          setErrorMessage('Order placed but some items could not be removed from the cart. Please try again.');
        }
      } else {
        setErrorMessage('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error creating sales order:', error);
      setErrorMessage('Failed to create sales order. Please try again.');
    }
  };
  
  const DeleteFromCart = async (product: Product) => {
    try {
      const response = await axios.delete(baseURL + `/api/cart`, { 
        data: { id: product.id, customer_id: customerId } 
      });
  
      if (response.status === 200) {
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.id !== product.id)
        );
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      setErrorMessage('Failed to remove item from cart.');
    }
  };
  
  const handleEditPaymentDetails = () => {
    setIsPaymentPlaced(false);
    setCanEditItems(true);
  };

  const paymentOptions = ['NEFT', 'RTGS', 'IMPS'];
  const pageTitle = "Orders";

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content="View and manage your selected orders in your cart. Check details, price and mode of payment."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="max-w-9xl mx-auto">
        <div className="mb-6">
          <Header cartItemCount={cartItems.length} />
        </div>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-between items-center mb-4 md:mb-8"
          >
            <div className="flex gap-2 md:gap-3 sm:mt-4 mt-0">
              <img src="/icons/ordersummary.svg" alt="Order Summary" className="text-black" />
              <h1 className="text-xl font-sans font-semibold">View Order Summary</h1>
            </div>
          </motion.div>

          <div className="flex flex-col md:flex-row">
            <div className="md:w-2/3 pr-0 md:pr-8">
              <div className="bg-white mb-6">
                <div className="flex justify-between items-center p-4">
                  <h2 className="text-md md:text-xl font-semibold font-sans">All Items</h2>
                </div>
                <AnimatePresence>
                  {cartItems.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="text-center p-6 text-gray-500"
                    >
                      Your product cart is empty
                    </motion.div>
                  ) : (
                    cartItems.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="relative flex flex-col md:flex-row items-start md:items-center p-4 border rounded-lg mb-4 bg-[#FBFEFF]"
                      >
                        <button
                          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                          onClick={() => handleRemoveFromCart(product)}
                          aria-label="Remove product"
                        >
                          <X size={18} />
                        </button>
                        <div className="flex-shrink-0 w-full md:w-auto">
                          <img
                            src={`https://inventory.zoho.in/api/v1/items/${product.item_id}/image?organization_id=60032377997`}
                            className="object-cover w-48 h-48 md:w-auto"
                          />
                        </div>
                        <div className="flex-grow mt-4 md:mt-0 md:ml-4 flex flex-col md:flex-row justify-between w-full">
                          <div>
                            <h3 className="font-sans">{product.name}</h3>
                          </div>
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between md:w-auto mt-4 md:mt-0">
                            <div className="flex items-center justify-between w-full">
                              <p className="font-semibold font-sans text-right text-lg md:text-base">
                                ₹ {product.price_per_unit}
                              </p>
                              <div className="flex items-center border rounded-md ml-4">
                                <button
                                  onClick={() => handleUpdateQuantity(product, -1)}
                                  className={`p-2 text-gray-600 hover:bg-gray-100 transition-all duration-200 ease-in-out ${!canEditItems ? 'cursor-not-allowed opacity-50' : ''}`}
                                  disabled={!canEditItems}
                                >
                                  <Minus size={16} />
                                </button>
                                <input
                                  type="number"
                                  className="w-12 text-center"
                                  value={product.qty}
                                  onChange={(e) => handleUpdateQuantity(product, parseInt(e.target.value, 10) - product.qty)}
                                  disabled={!canEditItems}
                                />
                                <button
                                  onClick={() => handleUpdateQuantity(product, 1)}
                                  className={`p-2 text-gray-600 hover:bg-gray-100 transition-all duration-200 ease-in-out ${!canEditItems ? 'cursor-not-allowed opacity-50' : ''}`}
                                  disabled={!canEditItems}
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="md:w-1/3 mt-6 md:mt-0">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-lg shadow-lg border p-4 md:p-6 mb-4 md:mb-6"
              >
                <div className="flex gap-2 md:gap-3">
                  <BsHandbag className="mt-1 font-semibold font-sans" />
                  <h2 className="text-md md:text-lg font-semibold font-sans mb-4">Products added to cart</h2>
                </div>
                <div className="flex justify-between items-center text-black font-semibold font-sans">
                  <span>Item Subtotal:</span>
                  <span className="text-xl md:text-2xl">
                    ₹ {cartItems.reduce((total, item) => total + parseFloat(item.price_per_unit) * item.qty, 0).toFixed(2)}
                  </span>
                </div>
              </motion.div>
              <AnimatePresence mode="wait">
                {isPaymentPlaced ? (
                  <motion.div
                    key="payment-details"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="relative bg-white border rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6"
                  >
                    <button
                      onClick={handleEditPaymentDetails}
                      className="absolute top-4 md:top-8 right-4 text-gray-600 hover:text-gray-800"
                    >
                      <Edit3 size={18} />
                    </button>

                    <h2 className="text-md md:text-lg mb-4 md:mb-8 inline-flex gap-2 md:gap-3 items-center">
                      <CreditCard size={20} />
                      Payment Details
                    </h2>
                    <div className="mb-4 md:mb-6">
                      <p className="text-black text-sm font-semibold font-sans">Payment Mode</p>
                      <p className="text-[#36383C] text-sm">{paymentDetails.mode}</p>
                    </div>
                    <div className="mb-4 md:mb-6">
                      <p className="text-black text-sm font-semibold font-sans">Reference Number</p>
                      <p className="text-[#36383C] text-sm">{paymentDetails.reference}</p>
                    </div>
                    <div className="mb-4 md:mb-6">
                      <p className="text-black text-sm font-semibold font-sans">Payment Date</p>
                      <p className="text-[#36383C] text-sm">{paymentDetails.date}</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="payment-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#FAFBFF] border rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6"
                  >
                    <h2 className="text-md md:text-lg font-semibold font-sans mb-4">Add Payment Details</h2>
                    <form onSubmit={handlePaymentSubmit}>
                      <div className="mb-4">
                        <label className="block text-sm font-sans text-gray-700 mb-2">Payment Mode</label>
                        <CustomDropdown
                          options={paymentOptions}
                          selectedOption={paymentDetails.mode}
                          onOptionSelect={(option) => setPaymentDetails({ ...paymentDetails, mode: option })}
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-sans text-gray-700 mb-2">Reference Number</label>
                        <input
                          type="text"
                          placeholder="Enter reference here"
                          className="w-full p-2 border border-gray-300 rounded"
                          value={paymentDetails.reference}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, reference: e.target.value })}
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-sans text-gray-700 mb-2">Payment Date</label>
                        <input
                          type="date"
                          className="w-full p-2 border border-gray-300 rounded"
                          value={paymentDetails.date}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, date: e.target.value })}
                        />
                      </div>
                      {errorMessage && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-500 text-sm mb-4"
                        >
                          {errorMessage}
                        </motion.p>
                      )}
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-black text-white py-2 rounded-md transition-all duration-100 ease-in-out hover:bg-[#171b1d]"
                      >
                        Place Order
                      </motion.button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
