"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Plus, Minus, Edit3, CreditCard } from 'lucide-react';
import { Smartphone, Calendar, Hash } from 'lucide-react';
import { BsHandbag } from 'react-icons/bs';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/app/components/header';
import Head from 'next/head';
import CustomDropdown from '@/app/components/customdropdown';
import { useRouter } from 'next/navigation';
import Footer from '@/app/components/footer';
import { decrypt } from '@/app/action/enc';
import Link from 'next/link';
import AddressDropdown from '../components/addressdropdown';
import { ArrowRight } from 'lucide-react';


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
interface Address {
  address_id: string;
  attention: string;
  address: string;
  street2: string;
  city: string;
  state: string;
  state_code: string;
  zip: string;
  country: string;
  country_code: string;
  phone: string;
  fax: string;
  tax_info_id: string;
}



const CartItem: React.FC<{
  product: Product;
  onRemove: (product: Product) => void;
  onUpdateQuantity: (product: Product, change: number) => void;
  canEditItems: boolean;
}> = ({ product, onRemove, onUpdateQuantity, canEditItems }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="relative flex flex-col p-5 border rounded-lg mb-4 bg-[#FBFEFF]"
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
  className={`p-2 text-gray-600 hover:bg-gray-100 transition-all duration-200 ease-in-out ${!canEditItems || product.quantity === 1 ? '' : ''}`}
>
  <Minus size={16} />
</button>

          <div
            className="w-12 text-center font-semibold"
          >
            {product.quantity}
          </div>
          <button
            onClick={() => onUpdateQuantity(product, 1)}
            className={`p-2 text-gray-600 hover:bg-gray-100 transition-all duration-200 ease-in-out ${!canEditItems ? 'cursor-not-allowed opacity-50' : ''}`}

            >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="mt-4 w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">HSN Code</th> 
               <th className="p-2 text-left">Unit Price</th>
              <th className="p-2 text-left">Tax (%)</th>
              <th className="p-2 text-left">Subtotal</th> 
            </tr> 
          </thead>
          <tbody>
            <tr>
              <td className="p-2">{product.hsn_or_sac}</td> 
              <td className="p-2">₹{product.rate.toFixed(2)}</td>
              <td className="p-2">{product.tax_percentage}%</td>
              <td className="p-2">₹{product.sub_total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

const OrderSummaryTable: React.FC<{ cartItems: Product[] }> = ({ cartItems }) => {
  const calculateSubtotal = (price: number, qty: number) => price * qty;
  const calculateTax = (subtotal: number, taxRate: number) => subtotal * (taxRate / 100);
  const calculateTotal = (subtotal: number, tax: number) => subtotal + tax;

  const grandTotal = cartItems.reduce((acc, item) => {
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
            {cartItems.map((item, index) => {
              const subtotal = calculateSubtotal(item.rate, item.quantity);
              const tax = calculateTax(subtotal, item.tax_percentage);
              const total = calculateTotal(subtotal, tax);

              return (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="border border-gray-300 p-2 text-center">{item.item_name}</td>
                  <td className="border border-gray-300 p-2 text-center">{item.hsn_or_sac}</td>
                  <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                   <td className="border border-gray-300 p-2 text-center">₹{item.rate.toFixed(2)}</td>
                  <td className="border border-gray-300 p-2 text-center">₹{subtotal.toFixed(2)}</td>
                  <td className="border border-gray-300 p-2 text-center">{item.tax_percentage}%</td>
                  <td className="border border-gray-300 p-2 text-center">₹{total.toFixed(2)}</td> 
                </tr>
              );
            })}

            {/* Total Shipping charge row */}
            {/* <tr className="bg-gray-50">
              <td className="border border-gray-300 p-2 text-center">Freight Charges</td>
              <td className="border border-gray-300 p-2 text-center"></td>
              <td className="border border-gray-300 p-2 text-center">1</td>
              <td className="border border-gray-300 p-2 text-center">
                ₹{cartItems.reduce((totalShipping, item) => totalShipping + (item.rate * item.quantity * 0.10), 0).toFixed(2)}
              </td>
              <td className="border border-gray-300 p-2 text-center">
                ₹{cartItems.reduce((totalShipping, item) => totalShipping + (item.rate * item.quantity * 0.10), 0).toFixed(2)}
              </td>
              <td className="border border-gray-300 p-2 text-center">18%</td>
              <td className="border border-gray-300 p-2 text-center">
                ₹{(cartItems.reduce((totalShipping, item) => totalShipping + (item.rate * item.quantity * 0.10), 0) * 1.18).toFixed(2)}
              </td>
            </tr> */}

            {/* Total Packaging charge row */}
             {/* <tr className="bg-white">
              <td className="border border-gray-300 p-2 text-center">Packing Charges</td>
              <td className="border border-gray-300 p-2 text-center"></td>
              <td className="border border-gray-300 p-2 text-center">1</td>
              <td className="border border-gray-300 p-2 text-center">
                ₹{cartItems.reduce((totalPackaging, item) => totalPackaging + (item.rate * item.quantity * 0.15), 0).toFixed(2)}
              </td>
              <td className="border border-gray-300 p-2 text-center">
                ₹{cartItems.reduce((totalPackaging, item) => totalPackaging + (item.rate * item.quantity * 0.15), 0).toFixed(2)}
              </td>
              <td className="border border-gray-300 p-2 text-center">18%</td>
              <td className="border border-gray-300 p-2 text-center">
                ₹{(cartItems.reduce((totalPackaging, item) => totalPackaging + (item.rate * item.quantity * 0.15), 0) * 1.18).toFixed(2)}
              </td>
            </tr>   */}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-right my-3">
        <p className="text-xl font-bold">
        Grand Total: <span className="text-2xl">₹{(grandTotal.toFixed(2))}</span>
        {/* grand total including shipping and packing charges */}
          {/* Grand Total: <span className="text-2xl">₹{(grandTotal  + cartItems.reduce((totalShipping, item) => totalShipping + (item.rate * item.quantity * 0.10), 0) * 1.18 + cartItems.reduce((totalPackaging, item) => totalPackaging + (item.rate * item.quantity * 0.15), 0) * 1.18 ).toFixed(2)}</span> */}


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
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    mode: '',
    reference: '',
    amount: '',
    date: '',
    contact_name: '', // New field for contact name
    contact_phone: '', // New field for contact phone
  });
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter();

  const retrieveToken = () => {
    if (typeof window !== 'undefined') {
      const encryptedToken = localStorage.getItem('token');
      if (encryptedToken) {
        return decrypt(encryptedToken);
      }
      const storedCustomerId = localStorage.getItem('customer_id');
      if (storedCustomerId) {
        setCustomerId(storedCustomerId);
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
        const response = await axios.get(`${baseURL}/api/cart-by-user-id`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCartItems(response.data.data);
        setShowPaymentDetails(response.data.data.length > 0);
        const addressResponse = await axios.get(`${baseURL}/api/user-details`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAddresses(addressResponse.data.addresses);

      } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('customer_id');
          localStorage.removeItem('first_name');
          localStorage.removeItem('username');

          router.push('/');
        }
      }
    };

    fetchCartItems();
  }, [baseURL, router]);
  const formatAddress = (address: Address) => {
    let parts = [
      address.attention,
      address.address,
      address.street2,
      address.city,
      address.state,
      address.zip,
      address.country
    ].filter(Boolean); // Remove empty or undefined elements
    return parts.join(', ');
  };


  useEffect(() => {
    // Calculate grand total whenever cartItems change
    const calculatedGrandTotal = calculateGrandTotal();
    setGrandTotal(calculatedGrandTotal);
  
    // If grand total is zero, set payment details to default values and clear any error message
    if (calculatedGrandTotal === 0) {
      setPaymentDetails({
        mode: '',
        reference: '',
        amount: '0',
        date: new Date().toISOString().split('T')[0],
        contact_name:'',
        contact_phone:'',
      });
      setErrorMessage(null);
    }
  }, [cartItems]);
  

  const today = new Date().toISOString().split('T')[0];

  const calculateSubTotal = (rate: number, quantity: number, taxPercentage: number): number => {
    const subtotal = rate * quantity;
    const tax = subtotal * (taxPercentage / 100);
    return subtotal + tax;
  };

  const calculateSubtotal = (price: number, qty: number) => price * qty;
  const calculateTax = (subtotal: number, taxRate: number) => subtotal * (taxRate / 100);
  const calculateTotal = (subtotal: number, tax: number) => subtotal + tax;

  const calculateGrandTotal = () => {
    const subtotal = cartItems.reduce((acc, item) => acc + calculateSubtotal(item.rate, item.quantity), 0);
    const tax = cartItems.reduce((acc, item) => {
      const itemSubtotal = calculateSubtotal(item.rate, item.quantity);
      return acc + calculateTax(itemSubtotal, item.tax_percentage);
    }, 0);
    const total = subtotal + tax;

     const totalShipping = cartItems.reduce((totalShipping, item) => totalShipping + (item.rate * item.quantity * 0.10), 0);
    const totalShippingWithTax = totalShipping * 1.18;

    const totalPackaging = cartItems.reduce((totalPackaging, item) => totalPackaging + (item.rate * item.quantity * 0.15), 0);
   const totalPackagingWithTax = totalPackaging * 1.18;

    return total ;
  };

  const handleUpdateQuantity = async (product: Product, change: number) => {
    const token = retrieveToken();
    if (!token) {
      router.push('/');
      return;
    }
  
    const newQuantity = product.quantity + change;  // Calculate the new quantity based on the change (-50 or +50)
    
    if (newQuantity > 0) {  // If the new quantity is still more than 0, update the quantity
      try {
        const response = await axios.post(`${baseURL}/api/add-cart`, {
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
                    sub_total: calculateSubTotal(item.rate, newQuantity, item.tax_percentage),
                  }
                : item
            )
          );
        } else {
          console.error('Failed to update quantity:', response);
          setErrorMessage('Failed to update item quantity.');
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
        setErrorMessage('Failed to update item quantity.');
      }
    } else {  // If the new quantity is 0 or less, remove the item from the cart
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
      const response = await axios.post(`${baseURL}/api/add-cart`, {
        item_id: product.item_id,
        quantity:0,
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
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('customer_id');
        localStorage.removeItem('first_name');
        localStorage.removeItem('username');

        router.push('/');
      }
      console.error('Error removing from cart:', error);
      setErrorMessage('Failed to remove item from cart.');
    }
  };

  const paymentOptions = ['NEFT', 'RTGS', 'IMPS', 'UPI'];
  const pageTitle = "Orders";

  const handleProceed = () => {
    if (cartItems.length === 0) {
      setErrorMessage("Your cart is empty. Add items before proceeding.");
      return;
    }
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 4000);

    setShowOrderSummary(true);
    setIsPaymentPlaced(true);
    setErrorMessage(null);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    {errorMessage && (
      <p className="text-red-500 text-sm mt-2">
        {errorMessage}
      </p>
    )}
    
    if (cartItems.length === 0) {
      setErrorMessage("Your cart is empty. Add items before placing an order.");
      return;
    }
  
    if (!selectedAddress) {
      setErrorMessage("Please select a shipping address before placing the order.");
      console.log("Error Set: Please select a shipping address before placing the order.");
      return;
    }

    if (!paymentDetails.contact_name || !paymentDetails.contact_phone) {
      setErrorMessage("Please fill in all details.");
      return;
    }
  
  
    if (grandTotal > 0) {
      if (!paymentDetails.mode || !paymentDetails.reference || !paymentDetails.amount || !paymentDetails.date || !paymentDetails.contact_name || !paymentDetails.contact_phone) {
        setErrorMessage("Please fill in all payment details.");
        return;
      }
  
      const enteredAmount = parseFloat(paymentDetails.amount);
      if (enteredAmount < parseFloat(grandTotal.toFixed(2))) {
        setErrorMessage(`Amount should be at least equal to the grand total of ₹${grandTotal.toFixed(2)}`);
        return;
      }
    }
  
    const timestamp = new Date().toISOString().replace(/[-:.T]/g, '').slice(0, 14);
    const salesOrderNumber = `SO-${paymentDetails.mode}-${timestamp}`;
  
    const salesOrderData = {
      salesorder_number: salesOrderNumber,
      shipping_address_id: selectedAddress, 
      line_items: cartItems.map((item) => ({
        item_id: item.item_id,
        name: item.item_name,
        quantity: item.quantity,
        Amount: parseFloat(item.rate.toString()),
      })),
      amount: parseFloat(paymentDetails.amount.toString()),
      reference_number: paymentDetails.reference,
      payment_date: paymentDetails.date,
      payment_mode: paymentDetails.mode,
      contact_name: paymentDetails.contact_name, 
      contact_phone: paymentDetails.contact_phone, 
    
    };
  
    if (salesOrderData.line_items.length === 0) {
      setErrorMessage('No items in the cart to place an order.');
      return;
    }
  
    try {
      const response = await axios.post(`${baseURL}/api/sales-order`, salesOrderData, {
        headers: {
          Authorization: `Bearer ${retrieveToken()}`,
          brand: 'renault',
        },
      });
  
      if (response.status === 200 || response.status === 201) {
        setOrderPlaced(true);
        setCanEditItems(false);
        setShowPaymentDetails(false);
        setErrorMessage(null);
  
        try {
          await Promise.all(
            cartItems.map(async (item) => {
              try {
                await handleRemoveFromCart(item);
              } catch (deleteError) {
                console.error(`Error removing item ${item.id} from cart:`, deleteError);
                throw new Error(`Failed to remove item ${item.item_name} from cart.`);
              }
            })
          );
          setCartItems([]);
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
  

  const handlePreviousOrdersClick = () => {
    router.push('/order-history');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentDetails((prev: any) => ({ ...prev, [name]: value }));
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
                We shall notify you by email when the order is confirmed by our backend team. You can also check the status of your orders from the{' '}
                <Link href="/order-history">
                  <span
                    className="font-bold text-blue-600 hover:underline cursor-pointer"
                    onClick={handlePreviousOrdersClick}
                  >
                    Order History
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

                      <div className="flex  gap-3  flex-wrap items-center text-black font-semibold font-sans">
                        <div className = 'flex gap-1'>
                        <span>Amount to be Paid Now</span>
                        </div>
                        <span className="text-xl">
                          ₹ {cartItems.reduce((total, item) => total + item.sub_total, 0).toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={handleProceed}
                        className={`mt-4 w-full py-2 px-4 rounded-md transition duration-300 ${
                          cartItems.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-black text-white'
                        }`}
                      >
                        Proceed
                      </button>

                      {errorMessage && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-red-500 text-sm mt-2"
                        >
                          {errorMessage}
                        </motion.p>
                      )}
                    </motion.div>
                  </div>
                )}
              </div>

              {/* Order Summary Section */}
{showOrderSummary && (
  <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <OrderSummaryTable cartItems={cartItems} />
    </motion.div>

   

    <div className="space-y-2">
      <label htmlFor="contactName" className="block text-sm font-medium text-black">Contact Name of the person at the Dealership *</label>
      <input
        type="text"
        id="contactName"
        name="contact_name"
        placeholder="Enter contact name here"
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black mb-3"
        value={paymentDetails.contact_name}
        onChange={handleInputChange} // Reuse the existing change handler
      />
    </div>

    <div className="space-y-2">
      <label htmlFor="contactPhone" className="block text-sm font-medium text-black mt-2">Phone number of the contact person *</label>
      <input
        type="text"
        id="contactPhone"
        name="contact_phone"
        placeholder="Enter contact phone here"
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
        value={paymentDetails.contact_phone}
        onChange={handleInputChange} // Reuse the existing change handler
      />
    </div>

    {addresses.length > 0 && (
      <div className="">
        <label htmlFor="address-select" className="block text-2xl font-semibold my-2">Shipping Details *</label>
        <AddressDropdown
          options={addresses.map((address) => ({
            value: address.address_id,
            label: formatAddress(address),
          }))}
          selectedOption={selectedAddress}
          onOptionSelect={(value) => setSelectedAddress(value)}
          className="w-full p-2 mr-3 border rounded-md my-3"
        />
      </div>
    )}
  
  {errorMessage && (
      <div className=" text-red-700">
        <span className="block sm:inline">{errorMessage}</span>
      </div>
    )}
                  <AnimatePresence mode="wait">
                  {showPaymentDetails && isPaymentPlaced && grandTotal > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-[#F6F8FD] border rounded-lg shadow-lg p-6 md:p-8 mb-6"
                      >
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                          Add Payment Details
                        </h2>

                      

                        <AnimatePresence mode="wait">
                          <div className="mb-2 flex flex-col md:flex-row items-center md:items-start gap-8">
                            <div className="sm:text-sm text-lg text-gray-600 sm:shadow-none flex-grow">
                              <h3 className="font-semibold text-lg mb-3 text-black">Our Bank Details</h3>
                              <span className="font-semibold">Topline Print Media</span>
                              <p><span className="font-semibold">Bank:</span> HDFC Bank</p>
                              <p><span className="font-semibold">Account No.:</span> 000000000000</p>
                              <p><span className="font-semibold">IFSC:</span> HDFC0000000</p>
                            </div>

                            <div className="w-40 h-40 bg-gray-100 flex items-center justify-center border-gray-300 rounded-lg pb-3">
                              <img src="/img/QR.jpeg" className='w-40 h-40' alt="QR Code" />
                            </div>
                          </div>
                        </AnimatePresence>

                        <form onSubmit={handlePlaceOrder} className="space-y-6">
                          <div className="space-y-2">
                            <label htmlFor="paymentMode" className="block text-sm font-medium text-gray-700">Payment Mode</label>
                            <div className="flex items-center">
                              <Smartphone className="text-gray-400 mr-2" />
                              <CustomDropdown
                                options={paymentOptions}
                                selectedOption={paymentDetails.mode}
                                onOptionSelect={(option) => setPaymentDetails({ ...paymentDetails, mode: option })}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                            <div className="flex items-center">
                              <CreditCard className="text-gray-400 mr-2" />
                              <input
                                type="number"
                                id="amount"
                                name="amount"
                                placeholder="Enter Amount here"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                value={paymentDetails.amount}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="reference" className="block text-sm font-medium text-gray-700">Reference Number</label>
                            <div className="flex items-center">
                              <Hash className="text-gray-400 mr-2" />
                              <input
                                type="text"
                                id="reference"
                                name="reference"
                                placeholder="Enter reference here"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                value={paymentDetails.reference}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">Payment Date</label>
                            <div className="flex items-center">
                              <Calendar className="text-gray-400 mr-2" />
                              <input
                                type="date"
                                id="paymentDate"
                                name="date"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                value={paymentDetails.date}
                                max={today}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>

                          <AnimatePresence>
                            {errorMessage && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-red-500 text-sm"
                              >
                                {errorMessage}
                              </motion.p>
                            )}
                          </AnimatePresence>

                          
                        </form>
                      </motion.div>
                    )}
                          <div className="flex justify-end mt-4">
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full sm:w-auto px-8 py-3 my-4 bg-black text-white font-bold font-sans rounded-lg shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
          onClick={handlePlaceOrder}
        >
          Place Order
        </motion.button>
      </div>

                  </AnimatePresence>
                </>
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
