"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Plus, Minus, Edit3, CreditCard } from 'lucide-react';
import { BsHandbag } from 'react-icons/bs';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/app/components/header';
import Head from 'next/head';
import CustomDropdown from '@/app/components/customdropdown';
import { useRouter } from 'next/navigation';
import Footer from '@/app/components/footer'
import { decrypt } from '@/app/action/enc';
import Link from 'next/link';

interface Product {
  id: number;
  userId: string;
  quantity: number;
  item_id: string;
  item_name: string;
  rate: number;
  tax_percentage: number;
  hsn_or_sac: string;
  sub_total: number;
  createdAt: string;
  updatedAt: string;
}

const CartItem: React.FC<{
  product: Product;
  onRemove: (product: Product) => void;
  onUpdateQuantity: (product: Product, change: number) => void;
  canEditItems: boolean;
}> = ({ product, onRemove, onUpdateQuantity, canEditItems }) => {

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      onUpdateQuantity(product, value - product.quantity);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="relative flex flex-col p-6 border rounded-lg mb-4 bg-[#FBFEFF]"
    >
      <button
        className="absolute sm:top-1 sm:right-1 top-2 right-2 text-gray-500 hover:text-gray-700"
        onClick={() => onRemove(product)}
        aria-label="Remove product"
      >
        <X size={18} />
      </button>
      
      <div className="flex md:flex-row justify-between items-start md:items-center w-full mt-3">
        <h3 className="font-sans text-lg mb-4 md:mb-0">{product.item_name}</h3>
        
        <div className="flex items-center border rounded-md">
          <button
            onClick={() => onUpdateQuantity(product, -1)}
            className={`p-2 text-gray-600 hover:bg-gray-100 transition-all duration-200 ease-in-out ${!canEditItems ? 'cursor-not-allowed opacity-50' : ''}`}
            disabled={!canEditItems}
          >
            <Minus size={16} />
          </button>
          <input
            type="number"
            className="w-12 text-center"
            value={product.quantity}
            onChange={handleQuantityChange}
            disabled={!canEditItems}
          />
          <button
            onClick={() => onUpdateQuantity(product, 1)}
            className={`p-2 text-gray-600 hover:bg-gray-100 transition-all duration-200 ease-in-out ${!canEditItems ? 'cursor-not-allowed opacity-50' : ''}`}
            disabled={!canEditItems}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      
      <div className="mt-4 w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Unit Price</th>
              <th className="p-2 text-left">Tax (%)</th>
              <th className="p-2 text-left">HSN Code</th>
              <th className="p-2 text-left">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2">₹{product.rate.toFixed(2)}</td>
              <td className="p-2">{product.tax_percentage}%</td>
              <td className="p-2">{product.hsn_or_sac}</td>
              <td className="p-2">₹{product.sub_total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

const OrderSummaryTable = ({ cartItems }:any) => {
  const calculateSubtotal = (price:any, qty:any) => price * qty;
  const calculateTax = (subtotal:any, taxRate:any) => subtotal * (taxRate / 100);
  const calculateTotal = (subtotal:any, tax:any) => subtotal + tax;

  const grandTotal = cartItems.reduce((acc:any, item:any) => {
    const subtotal = calculateSubtotal(item.rate, item.quantity);
    const tax = calculateTax(subtotal, item.tax_percentage);
    return acc + calculateTotal(subtotal, tax);
  }, 0);

  return (
      <div className="p-4 sm:p-1 justify-center bg-white max-w-9xl">
        <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 min-w-[640px]">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2">Product Name</th>
                <th className="border border-gray-300 p-2">HSN</th>
                <th className="border border-gray-300 p-2">Qty</th>
                <th className="border border-gray-300 p-2">Unit Price</th>
                <th className="border border-gray-300 p-2">Subtotal</th>
                <th className="border border-gray-300 p-2">Tax</th>
                <th className="border border-gray-300 p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item:any, index:any) => {
                const subtotal = calculateSubtotal(item.rate, item.quantity);
                const tax = calculateTax(subtotal, item.tax_percentage);
                const total = calculateTotal(subtotal, tax);
    
                return (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border border-gray-300 p-2 text-center">{item.item_name}</td>
                    <td className="border border-gray-300 p-2 text-center">{item.hsn_or_sac}</td>
                    <td className="border border-gray-300 p-2 text-center ">{item.quantity}</td>
                    <td className="border border-gray-300 p-2 text-center">₹{item.rate.toFixed(2)}</td>
                    <td className="border border-gray-300 p-2 text-center">₹{subtotal.toFixed(2)}</td>
                    <td className="border border-gray-300 p-2 text-center">{item.tax_percentage}%</td>
                    <td className="border border-gray-300 p-2 text-center">₹{total.toFixed(2)}</td>
                  </tr>
                );
              })}
    
              {/* Total Shipping charge row */}
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-2 text-center">Freight Charges</td>
                <td className="border border-gray-300 p-2 text-center"></td>
                <td className="border border-gray-300 p-2 text-center">1</td>
                <td className="border border-gray-300 p-2 text-center">
                  ₹{cartItems.reduce((totalShipping:any, item:any) => totalShipping + (item.rate * item.quantity * 0.10), 0).toFixed(2)}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  ₹{cartItems.reduce((totalShipping:any, item:any) => totalShipping + (item.rate * item.quantity * 0.10), 0).toFixed(2)}
                </td>
                <td className="border border-gray-300 p-2 text-center">18%</td>
                
                <td className="border border-gray-300 p-2 text-center">
                  ₹{(cartItems.reduce((totalShipping:any, item:any) => totalShipping + (item.rate * item.quantity * 0.10), 0) * 1.18).toFixed(2)}
                </td>
              </tr>
    
              {/* Total Packaging charge row */}
              <tr className="bg-white">
                <td className="border border-gray-300 p-2 text-center">Packing Charges</td>
                <td className="border border-gray-300 p-2 text-center"></td>
                <td className="border border-gray-300 p-2 text-center">1</td>
                <td className="border border-gray-300 p-2 text-center">
                  ₹{cartItems.reduce((totalPackaging:any, item:any) => totalPackaging + (item.rate * item.quantity * 0.15), 0).toFixed(2)}
                </td>
                <td className="border border-gray-300 p-2 text-center">
                  ₹{cartItems.reduce((totalPackaging:any, item:any) => totalPackaging + (item.rate * item.quantity * 0.15), 0).toFixed(2)}
                </td>
                <td className="border border-gray-300 p-2 text-center">18%</td>
                <td className="border border-gray-300 p-2 text-center">
                  ₹{(cartItems.reduce((totalPackaging:any, item:any) => totalPackaging + (item.rate * item.quantity * 0.15), 0) * 1.18).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right my-3">
          <p className="text-xl font-bold">
            Grand Total: <span className="text-2xl">₹{(grandTotal + cartItems.reduce((totalShipping:any, item:any) => totalShipping + (item.rate * item.quantity * 0.10), 0) * 1.18 + cartItems.reduce((totalPackaging:any, item:any) => totalPackaging + (item.rate * item.quantity * 0.15), 0) * 1.18).toFixed(2)}</span>
          </p>
        </div>
      </div>
    );
    
};

const CartPage: React.FC = () => {
  const [isPaymentPlaced, setIsPaymentPlaced] = useState(false);
  const [canEditItems, setCanEditItems] = useState(true);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    mode: '',
    reference: '',
    amount:'',
    date: '',
  });
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
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

    const fetchCartItems = async () => {
      try {
        const response = await axios.get(baseURL + '/api/cart-by-user-id', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCartItems(response.data.data);
        setShowPaymentDetails(response.data.data.length > 0);
      } catch (error) {
        console.error('Error fetching cart items:', error);
        setErrorMessage('Failed to fetch cart items. Please try again.');
      }
    };

    fetchCartItems();
  }, [baseURL, router]);

  const today = new Date().toISOString().split('T')[0];

  const calculateSubTotal = (rate: number, quantity: number, taxPercentage: number): number => {
    const subtotal = rate * quantity;
    const tax = subtotal * (taxPercentage / 100);
    return subtotal + tax;
  };

  const handleUpdateQuantity = async (product: Product, change: number) => {
    const token = retrieveToken();
    if (!token) {
      router.push('/');
      return;
    }

    const newQuantity = product.quantity + change;
    if (newQuantity > 0) {
      try {
        const response = await axios.post(baseURL + `/api/add-cart`, {
          item_id: product.item_id,
          quantity: newQuantity,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            brand: 'renault',
          },
        });
        
        if (response.status === 200) {
          setCartItems((prevItems) =>
            prevItems.map((item) =>
              item.id === product.id 
                ? { 
                    ...item, 
                    quantity: newQuantity,
                    sub_total: calculateSubTotal(item.rate, newQuantity, item.tax_percentage)
                  } 
                : item
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
    const token = retrieveToken();
    if (!token) {
      router.push('/');
      return;
    }
    try {
      const response = await axios.post(baseURL + `/api/add-cart`, { 
        item_id: product.item_id,
        quantity: 0,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          brand: 'renault',
        },
      });
   
      if (response.status === 200) {
        const updatedCartItems = cartItems.filter((item) => item.id !== product.id);
        setCartItems(updatedCartItems);
        setShowPaymentDetails(updatedCartItems.length > 0);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      setErrorMessage('Failed to remove item from cart.');
    }
  };

  

  const paymentOptions = ['NEFT', 'RTGS', 'IMPS'];
  const pageTitle = "Orders";

  const handleProceed = () => {
    setShowOrderSummary(true);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderPlaced(true);
    setCanEditItems(false);
  };

  const handlePreviousOrdersClick = () => {
    router.push('/order-history');
  };


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
          {orderPlaced ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-20"
            >
              <h2 className="text-3xl font-bold mb-4">Thank you for placing your order!</h2>
              <p className="text-xl mb-8">
              We shall notify you by email when the order is confirmed by our backend team. You can also check the status of your orders from the {' '} 
                <Link href="/order-history">
                  <span 
                    className="font-bold text-blue-600 hover:underline cursor-pointer"
                    onClick={handlePreviousOrdersClick}
                  >
                    Previous Orders
                  </span>
                </Link>{' '}
                section.
              </p>
            </motion.div>
          ) : (
            <>
              {!showOrderSummary && (
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
              )}


          <div className="flex flex-col md:flex-row md:gap-8">
            {!showOrderSummary && (
              <div className="md:w-3/5 lg:w-2/3 pr-0">
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
                      cartItems.map((product) => (
                        <CartItem
                          key={product.id}
                          product={product}
                          onRemove={handleRemoveFromCart}
                          onUpdateQuantity={handleUpdateQuantity}
                          canEditItems={canEditItems}
                        />
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {!showOrderSummary && (
              <div className="md:w-1/2 lg:w-1/3 mt-6 md:mt-0">
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
                    <span>Subtotal:</span>
                    <span className="text-xl md:text-2xl">
                      ₹ {cartItems.reduce((total, item) => total + item.sub_total, 0).toFixed(2)}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleProceed}
                    className="mt-4 w-full bg-black text-white py-2 px-4 rounded-md  transition duration-300"
                  >
                    Proceed
                  </button>
                </motion.div>
              </div>
            )}
          </div>

          {/* Order Summary Section */}
          {showOrderSummary && (
            <><motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <OrderSummaryTable cartItems={cartItems} />
            </motion.div><AnimatePresence mode="wait">
                {showPaymentDetails && (
                  isPaymentPlaced ? (
                    <motion.div
                      key="payment-details"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="relative bg-white border rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6"
                    >
                      {/* <button
                        onClick={handleEditPaymentDetails}
                        className="absolute top-4 md:top-8 right-4 text-gray-600 hover:text-gray-800"
                        disabled
                      >
                        <Edit3 size={18} />
                      </button> */}

                      <h2 className="text-md md:text-lg mb-4 md:mb-8 inline-flex gap-2 md:gap-3 items-center">
                        <CreditCard size={20} />
                        Payment Details
                      </h2>
                      <div className="mb-4 md:mb-6">
                        <p className="text-black text-sm font-semibold font-sans">Payment Mode</p>
                        <p className="text-[#36383C] text-sm">{paymentDetails.mode}</p>
                      </div>
                      <div className="mb-4 md:mb-6">
                        <p className="text-black text-sm font-semibold font-sans">Amount</p>
                        <p className="text-[#36383C] text-sm">{paymentDetails.reference}</p>
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
                    <form onSubmit={handlePlaceOrder}>
                      <div className="mb-4">
                        <label className="block text-sm font-sans text-gray-700 mb-2">Payment Mode</label>
                        <CustomDropdown
                          options={paymentOptions}
                          selectedOption={paymentDetails.mode}
                          onOptionSelect={(option) => setPaymentDetails({ ...paymentDetails, mode: option })}
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-sans text-gray-700 mb-2">Amount</label>
                        <input
                          type="text"
                          placeholder="Enter Amount here"
                          className="w-full p-2 border border-gray-300 rounded"
                          value={paymentDetails.amount} // Ensure this is the correct state for amount
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, amount: e.target.value })}
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
                          max={today}
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
                      <div className="flex justify-end">
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full sm:w-60 bg-black text-white py-2 rounded-md transition-all duration-100 ease-in-out hover:bg-[#171b1d]"
                        >
                          Place Order
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                  
                  )
                )}
              </AnimatePresence></>

          )}
          </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;