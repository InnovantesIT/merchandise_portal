"use client";

import React, { useState, useEffect, useRef } from 'react';
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
import ShippingAddressDropdown from '../components/shippingaddressdropdown';
import { ArrowRight } from 'lucide-react';
import AddressModal from '../components/addressmodal';
import { IndianRupee } from 'lucide-react';
import BillingDetails from '../components/BillingDetails';

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
  moq: number; // Minimum Order Quantity
  zoho_item_name: string;
  zoho_item_price: string;
  calculations: {
    base_amount: number;
    item_tax_percentage: number;
    item_tax_amount: number;
    item_subtotal: number;
  };
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
}

interface BillingAddress {
  address_id: string | null;
  attention: string | null;
  address: string | null;
  street2: string | null;
  city: string | null;
  state: string | null;
  state_code: string | null;
  country: string | null;
  country_code: string | null;
  zip: string | null;
  phone: string | null;
  fax: string | null;
  gst_no?: string;
  email?: string;
}

interface CustomShippingAddress {
  attention: string;
  address: string;
  country: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

interface CartSummary {
  total_items: number;
  cart_subtotal: number;
  extra_charges_breakdown: Array<{
    percentage_of_cart: string;
    charge_amount: number;
    charge_name: string;
    gst_percentage: string;
    gst_amount: number;
    total_charge: number;
    hsn_code?: string;
  }>;
  total_extra_charges: number;
  cart_total: number;
}

const CartItem: React.FC<{
  product: Product;
  onRemove: (product: Product) => void;
  onUpdateQuantity: (product: Product, change: number) => void;
  onSetQuantity: (product: Product, quantity: number) => void;
  canEditItems: boolean;
  cartSummary?: CartSummary | null;
}> = ({ product, onRemove, onUpdateQuantity, onSetQuantity, canEditItems, cartSummary }) => {
  const hasMOQ = product.moq && product.moq > 0;
  const isAtMOQ = hasMOQ ? product.quantity <= product.moq : false;
  const [inputValue, setInputValue] = useState(product.quantity.toString());

  useEffect(() => {
    setInputValue(product.quantity.toString());
  }, [product.quantity]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const newQuantity = parseInt(inputValue, 10);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      if (hasMOQ && newQuantity < product.moq) {
        onSetQuantity(product, product.moq);
      } else {
        onSetQuantity(product, newQuantity);
      }
    } else {
      setInputValue(product.quantity.toString());
    }
  };

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
        <div className="flex flex-col">
          <h3 className="font-sans text-lg mb-2">{product.item_name}</h3>
          {hasMOQ && <p className="text-sm text-gray-600">Min. Order Qty: {product.moq}</p>}
        </div>

        <div className="flex items-center border rounded-md">
          <button
            onClick={() => onUpdateQuantity(product, -1)}
            disabled={!canEditItems || isAtMOQ}
            className={`p-2 text-gray-600 hover:bg-gray-100 transition-all duration-200 ease-in-out ${!canEditItems || isAtMOQ ? 'cursor-not-allowed opacity-50' : ''
              }`}
            title={isAtMOQ ? `Cannot reduce below minimum order quantity (${product.moq})` : 'Decrease quantity'}
          >
            <Minus size={16} />
          </button>

          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="w-16 text-center font-semibold border-x-0"
            disabled={!canEditItems}
          />

          <button
            onClick={() => onUpdateQuantity(product, 1)}
            disabled={!canEditItems}
            className={`p-2 text-gray-600 hover:bg-gray-100 transition-all duration-200 ease-in-out ${!canEditItems ? 'cursor-not-allowed opacity-50' : ''
              }`}
            title="Increase quantity"
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
              <th className="p-2 text-left">Price</th>
              <th className="p-2 text-left">GST (%)</th>
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

const ExtraChargeItem: React.FC<{
  charge: {
    percentage_of_cart: string;
    charge_amount: number;
    charge_name: string;
    gst_percentage: string;
    gst_amount: number;
    total_charge: number;
    hsn_code?: string;
  };
}> = ({ charge }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="relative flex flex-col p-5 border rounded-lg mb-4 bg-white"
    >
      <div className="flex md:flex-row justify-between items-start md:items-center w-full mt-3">
        <div className="flex flex-col">
          <h3 className="font-sans text-lg mb-2 text-black">{charge.charge_name}</h3>
        </div>
      </div>

      <div className="mt-4 w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">HSN Code</th>
              <th className="p-2 text-left">Charge Amount</th>
              <th className="p-2 text-left">GST (%)</th>
              <th className="p-2 text-left">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2">{charge.hsn_code || '-'}</td>
              <td className="p-2">₹{Number(charge.charge_amount).toFixed(2)}</td>
              <td className="p-2">{charge.gst_percentage}%</td>
              <td className="p-2">₹{Number(charge.total_charge).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

const OrderSummaryTable: React.FC<{ cartItems: Product[], cartSummary: CartSummary }> = ({ cartItems, cartSummary }) => {
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
              <th className="border border-gray-300 p-2">Price</th>
              <th className="border border-gray-300 p-2">Subtotal</th>
              <th className="border border-gray-300 p-2">Tax</th>
              <th className="border border-gray-300 p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="border border-gray-300 p-2 text-center">{item.item_name}</td>
                <td className="border border-gray-300 p-2 text-center">{item.hsn_or_sac}</td>
                <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                <td className="border border-gray-300 p-2 text-center">₹{item.rate.toFixed(2)}</td>
                <td className="border border-gray-300 p-2 text-center">₹{item.calculations.base_amount.toFixed(2)}</td>
                <td className="border border-gray-300 p-2 text-center">₹{item.calculations.item_tax_amount.toFixed(2)}</td>
                <td className="border border-gray-300 p-2 text-center">₹{item.sub_total.toFixed(2)}</td>
              </tr>
            ))}

            {/* Extra Charges Rows */}
            {cartSummary?.extra_charges_breakdown.length > 0 &&
              cartSummary.extra_charges_breakdown.map((charge, index) => (
                <tr key={`charge-${index}`} className="bg-gray-50">
                  <td className="border border-gray-300 p-2 text-center font-medium">
                    {charge.charge_name}
                  </td>
                  <td className="border border-gray-300 p-2 text-center">{charge.hsn_code || '-'}</td>
                  <td className="border border-gray-300 p-2 text-center">-</td>
                  <td className="border border-gray-300 p-2 text-center">₹{Number(charge.charge_amount).toFixed(2)}</td>
                  <td className="border border-gray-300 p-2 text-center">₹{Number(charge.charge_amount).toFixed(2)}</td>
                  <td className="border border-gray-300 p-2 text-center font-medium">₹{Number(charge.gst_amount).toFixed(2)}</td>
                  <td className="border border-gray-300 p-2 text-center font-medium">₹{Number(charge.total_charge).toFixed(2)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="mt-6 space-y-2 text-right">
        <div className="flex justify-between items-center border-t pt-2">
          <span className="text-xl font-bold">Grand Total:</span>
          <span className="text-2xl font-bold">₹{cartSummary ? cartSummary.cart_total.toFixed(2) : '0.00'}</span>
        </div>
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
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<string>('');
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    mode: '',
    reference: '',
    amount: '',
    date: '',
    contact_name: '',
    contact_phone: '',
  });
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [grandTotal, setGrandTotal] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedShippingAddressForEdit, setSelectedShippingAddressForEdit] = useState<Address | null>(null);
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [customShippingAddress, setCustomShippingAddress] = useState<CustomShippingAddress | null>(null);
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  const router = useRouter();
  const [showUPI, setShowUPI] = useState(false);
  const [billingDetails, setBillingDetails] = useState<BillingAddress | null>(null);
  const [isBillingDetailsValid, setIsBillingDetailsValid] = useState(false);
  const [billingDetailsError, setBillingDetailsError] = useState(false);
  const billingDetailsRef = useRef<HTMLDivElement>(null);

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

        // Handle empty cart case
        if (!response.data.data || response.data.data.length === 0) {
          setCartItems([]);
          setShowPaymentDetails(false);
          setCartSummary(null);
          setGrandTotal(0);
          setPaymentDetails(prev => ({
            ...prev,
            amount: '0.00'
          }));
        } else {
          const cartItemsWithMOQ = response.data.data.map((item: Product) => ({
            ...item,
            moq: item.moq || 1
          }));

          setCartItems(cartItemsWithMOQ);
          setShowPaymentDetails(cartItemsWithMOQ.length > 0);

          // Set cart summary from API response
          if (response.data.cart_summary) {
            setCartSummary(response.data.cart_summary);
            setGrandTotal(response.data.cart_summary.cart_total);
            // Prefill the amount field with the grand total
            setPaymentDetails(prev => ({
              ...prev,
              amount: response.data.cart_summary.cart_total.toFixed(2)
            }));
          } else {
            setCartSummary(null);
            setGrandTotal(0);
            setPaymentDetails(prev => ({
              ...prev,
              amount: '0.00'
            }));
          }
        }

        // Add debugging for addresses
        console.log('Fetching addresses...');
        const addressResponse = await axios.get(`${baseURL}/api/user-details`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Address response:', addressResponse.data);

        // Fix: Handle shipping_address as an object, not an array
        const shippingAddress = addressResponse.data.addresses;
        console.log('Processed addresses:', shippingAddress ? [shippingAddress] : []);
        setAddresses(shippingAddress);

      } catch (error: any) {
        console.error('Error fetching data:', error);
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

  const formatShippingAddress = (address: Address) => {
    let parts = [
      address.attention,
      address.address,
      address.street2,
      address.city,
      address.state,
      address.zip,
      address.country
    ].filter(Boolean);
    return parts.join(', ');
  };

  const handleUpdateQuantity = async (product: Product, change: number) => {
    const token = retrieveToken();
    if (!token) {
      router.push('/');
      return;
    }

    const newQuantity = product.quantity + change;
    const hasMOQ = product.moq && product.moq > 0;

    if (change < 0 && hasMOQ && newQuantity < product.moq) {
      setErrorMessage(`Cannot reduce quantity below minimum order quantity (${product.moq})`);
      return;
    }

    if (newQuantity > 0) {
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
          // Check if the response has the expected structure
          if (response.data && response.data.data) {
            const updatedCartItems = response.data.data.map((item: Product) => ({
              ...item,
              moq: item.moq || 1
            }));

            setCartItems(updatedCartItems);

            // Update cart summary if available
            if (response.data.cart_summary) {
              setCartSummary(response.data.cart_summary);
              setGrandTotal(response.data.cart_summary.cart_total);
            }

            setErrorMessage(null);
            console.log('API Response:', response.data);
            console.log('Updated cart items:', response.data.data);
          } else {
            // If the response structure is different, fetch the cart again
            const cartResponse = await axios.get(`${baseURL}/api/cart-by-user-id`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            const cartItemsWithMOQ = cartResponse.data.data.map((item: Product) => ({
              ...item,
              moq: item.moq || 1
            }));

            setCartItems(cartItemsWithMOQ);

            if (cartResponse.data.cart_summary) {
              setCartSummary(cartResponse.data.cart_summary);
              setGrandTotal(cartResponse.data.cart_summary.cart_total);
            } else {
              setCartSummary(null);
              setGrandTotal(0);
            }
            setErrorMessage(null);
          }
        } else {
          console.error('Failed to update quantity:', response);
          setErrorMessage('Failed to update item quantity.');
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
        setErrorMessage('Failed to update item quantity.');
      }
    } else {
      handleRemoveFromCart(product);
    }
  };

  const handleSetQuantity = async (product: Product, newQuantity: number) => {
    const token = retrieveToken();
    if (!token) {
      router.push('/');
      return;
    }

    if (newQuantity <= 0) {
      handleRemoveFromCart(product);
      return;
    }

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
        if (response.data && response.data.data) {
          const updatedCartItems = response.data.data.map((item: Product) => ({
            ...item,
            moq: item.moq || 1
          }));

          setCartItems(updatedCartItems);

          if (response.data.cart_summary) {
            setCartSummary(response.data.cart_summary);
            setGrandTotal(response.data.cart_summary.cart_total);
          }

          setErrorMessage(null);
        } else {
          const cartResponse = await axios.get(`${baseURL}/api/cart-by-user-id`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const cartItemsWithMOQ = cartResponse.data.data.map((item: Product) => ({
            ...item,
            moq: item.moq || 1
          }));

          setCartItems(cartItemsWithMOQ);

          if (cartResponse.data.cart_summary) {
            setCartSummary(cartResponse.data.cart_summary);
            setGrandTotal(cartResponse.data.cart_summary.cart_total);
          } else {
            setCartSummary(null);
            setGrandTotal(0);
          }
          setErrorMessage(null);
        }
      } else {
        console.error('Failed to update quantity:', response);
        setErrorMessage('Failed to update item quantity.');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      setErrorMessage('Failed to update item quantity.');
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
        quantity: 0,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          brand: 'renault',
        },
      });

      if (response.status === 200) {
        // After removing item, fetch updated cart data
        try {
          const cartResponse = await axios.get(`${baseURL}/api/cart-by-user-id`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          // Handle empty cart case
          if (!cartResponse.data.data || cartResponse.data.data.length === 0) {
            setCartItems([]);
            setShowPaymentDetails(false);
            setCartSummary(null);
            setGrandTotal(0);
            setPaymentDetails(prev => ({
              ...prev,
              amount: '0.00'
            }));
          } else {
            const cartItemsWithMOQ = cartResponse.data.data.map((item: Product) => ({
              ...item,
              moq: item.moq || 1
            }));

            setCartItems(cartItemsWithMOQ);
            setShowPaymentDetails(cartItemsWithMOQ.length > 0);

            if (cartResponse.data.cart_summary) {
              setCartSummary(cartResponse.data.cart_summary);
              setGrandTotal(cartResponse.data.cart_summary.cart_total);
              // Update payment details amount with new total
              setPaymentDetails(prev => ({
                ...prev,
                amount: cartResponse.data.cart_summary.cart_total.toFixed(2)
              }));
            } else {
              setCartSummary(null);
              setGrandTotal(0);
              setPaymentDetails(prev => ({
                ...prev,
                amount: '0.00'
              }));
            }
          }

        } catch (fetchError) {
          console.error('Error fetching updated cart:', fetchError);
          setCartSummary(null);
          setGrandTotal(0);
          // Fallback to local state update if API call fails
          const updatedCartItems = cartItems.filter(item => item.item_id !== product.item_id);
          setCartItems(updatedCartItems);
          setShowPaymentDetails(updatedCartItems.length > 0);

          if (response.data?.cart_summary) {
            setCartSummary(response.data.cart_summary);
            setGrandTotal(response.data.cart_summary.cart_total);
          } else {
            const newSubtotal = updatedCartItems.reduce((sum, item) => sum + item.sub_total, 0);
            setGrandTotal(newSubtotal);
          }
        }
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

  const paymentOptions = ['NET BANKING', 'UPI'];
  const pageTitle = "Orders";

  const handleProceed = () => {
    if (cartItems.length === 0) {
      setErrorMessage("Your cart is empty. Add items before proceeding.");
      return;
    }

    for (const item of cartItems) {
      if (item.moq && item.quantity < item.moq) {
        setErrorMessage(`Quantity for ${item.item_name} is below the minimum order quantity of ${item.moq}.`);
        return;
      }
    }

    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 4000);

    setShowOrderSummary(true);
    setIsPaymentPlaced(true);
    setErrorMessage(null);

    // Also prefill amount when proceeding to payment
    setPaymentDetails(prev => ({
      ...prev,
      amount: grandTotal.toFixed(2)
    }));
  };

  const handleShippingAddressSelect = (addressId: string) => {
    setSelectedShippingAddress(addressId);
    const address = addresses.find(addr => addr.address_id === addressId);
    if (address) {
      setSelectedShippingAddressForEdit(address);
      setIsNewAddress(false);
      setShowAddressModal(true);
    }
  };

  const handleAddNewShippingAddress = () => {
    setSelectedShippingAddressForEdit(null);
    setIsNewAddress(true);
    setShowAddressModal(true);
  };

  const handleShippingAddressConfirm = (address: CustomShippingAddress, isModified: boolean) => {
    if (isModified) {
      setCustomShippingAddress(address);
      setUseCustomAddress(true);
      setSelectedShippingAddress('0'); // Set to 0 to indicate custom address
    } else {
      setUseCustomAddress(false);
      setCustomShippingAddress(null);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      setErrorMessage("Your cart is empty. Add items before placing an order.");
      return;
    }

    if (!paymentDetails.contact_name || !paymentDetails.contact_phone) {
      setErrorMessage("Please fill in all details.");
      return;
    }

    if (!isBillingDetailsValid) {
      setBillingDetailsError(true);
      billingDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

    const salesOrderData: any = {
      salesorder_number: salesOrderNumber,
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
      upi_used: showUPI, // or qr_image: showQR ? '/img/QR.jpg' : null
    };

    // Add shipping address logic
    if (useCustomAddress && customShippingAddress) {
      salesOrderData.shipping_address_id = 0;
      salesOrderData.custom_shipping_address = customShippingAddress;
    } else {
      salesOrderData.shipping_address_id = selectedShippingAddress;
    }

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

  const handleBillingDetailsChange = (details: BillingAddress, isValid: boolean) => {
    setBillingDetails(details);
    setIsBillingDetailsValid(isValid);
    if (isValid) {
      setBillingDetailsError(false);
    }
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
                          <>
                            {cartItems.map((product) => (
                              <CartItem
                                key={product.id}
                                product={product}
                                onRemove={handleRemoveFromCart}
                                onUpdateQuantity={handleUpdateQuantity}
                                onSetQuantity={handleSetQuantity}
                                canEditItems={canEditItems}
                                cartSummary={cartSummary}
                              />
                            ))}

                            {/* Display extra charges as separate items */}
                            {cartSummary?.extra_charges_breakdown?.map((charge, index) => (
                              <ExtraChargeItem
                                key={`extra-charge-${index}`}
                                charge={charge}
                              />
                            ))}
                          </>
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
                      className="bg-white border rounded-lg shadow-lg p-4 md:p-6 mb-6"
                    >
                      <header className="flex items-center gap-2 md:gap-3 mb-2">
                        <h2 className="text-base font-semibold font-sans text-gray-800">
                          <span>Amount to be Paid Now</span>
                        </h2>
                      </header>

                      <div className="border-t pt-2 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-800 font-semibold">
                            Total Price
                          </span>
                          <span className="text-xl font-bold flex items-center gap-2">
                            <IndianRupee size={20} /> {cartSummary ? cartSummary.cart_total.toFixed(2) : '0.00'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handleProceed}
                        className={`mt-2 w-full py-2 px-4 rounded-md font-sans hover:scale-105 hover:shadow-lg hover:bg-white hover:border-black border-2 border-gray-50 hover:text-black tracking-wider transition duration-300 ${cartItems.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-black text-white'
                          }`}
                        disabled={cartItems.length === 0}
                      >
                        Proceed
                      </button>

                      {errorMessage && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="mt-2 text-red-500 text-sm"
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
                    <OrderSummaryTable cartItems={cartItems} cartSummary={cartSummary!} />
                  </motion.div>

                  <div className="mt-6" ref={billingDetailsRef}>
                    <BillingDetails
                      onBillingDetailsChange={handleBillingDetailsChange}
                      showError={billingDetailsError}
                    />
                  </div>

                  <div className="mt-6">
                    <label htmlFor="shipping-address-select" className="block text-2xl font-semibold my-2">Shipping Details *</label>

                    {addresses && addresses.length > 0 ? (
                      <ShippingAddressDropdown
                        addresses={addresses}
                        selectedAddressId={selectedShippingAddress}
                        onAddressSelect={(addressId: string) => {
                          setSelectedShippingAddress(addressId);
                          const address = addresses?.find(addr => addr.address_id === addressId);
                          if (address) {
                            setSelectedShippingAddressForEdit(address);
                            setIsNewAddress(false);
                          }
                        }}
                        onAddNewAddress={handleAddNewShippingAddress}
                        placeholder="Select shipping address"
                        className="mb-4"
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="text-gray-500 mb-2">
                          No shipping addresses found. Please add a new address.
                        </div>
                        <button
                          type="button"
                          onClick={handleAddNewShippingAddress}
                          className="px-4 py-2 bg-black text-white rounded-md mb-5 hover:bg-gray-800 transition-colors"
                        >
                          Add New Shipping Address
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Display selected shipping address info */}
                  {useCustomAddress && customShippingAddress && (
                    <div className="bg-gray-50 p-4 rounded-lg mt-4">
                      <h3 className="font-semibold mb-2">Shipping Address:</h3>
                      <p>{customShippingAddress.address}</p>
                      <p>{customShippingAddress.city}, {customShippingAddress.state} {customShippingAddress.zip}</p>
                      <p>{customShippingAddress.country}</p>
                      {customShippingAddress.phone && <p>Phone: {customShippingAddress.phone}</p>}
                    </div>
                  )}

                  {errorMessage && (
                    <div className="text-red-700">
                      <span className="block sm:inline">{errorMessage}</span>
                    </div>
                  )}

<div className="space-y-2">
                    <label htmlFor="contactName" className="block text-sm font-medium text-black">Contact Name of the person at the Dealership *</label>
                    <input
                      type="text"
                      id="contactName"
                      name="contact_name"
                      placeholder="Enter contact name here"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black mb-3"
                      value={paymentDetails.contact_name}
                      onChange={handleInputChange}
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
                      onChange={handleInputChange}
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    {showPaymentDetails && isPaymentPlaced && grandTotal > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-[#F6F8FD] border rounded-lg shadow-lg p-6 md:p-8 my-6"
                      >
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                          Add Payment Details
                        </h2>

                        <AnimatePresence mode="wait">
                          <div className="mb-2 flex flex-col md:flex-row items-center md:items-start gap-8">
                            <div className="sm:text-sm text-lg text-gray-600 sm:shadow-none flex-grow">
                              <h3 className="font-semibold text-lg mb-3 text-black">Our Bank Details</h3>
                              <span className="font-semibold">Topline Print Media Private Limited</span>
                              <p><span className="font-semibold">Bank:</span> Kotak Mahindra Bank</p>
                              <p><span className="font-semibold">Account No.:</span> 06772000004324</p>
                              <p><span className="font-semibold">IFSC:</span> KKBK0000217</p>
                              <p><span className="font-semibold">Branch:</span> KOTAK MAHINDRA BANK, KARKARDOOMA, Delhi</p>
                              <p><span className="font-semibold">City:</span> Delhi</p>
                            </div>

                            {showUPI && (
                              <div className="w-52 h-52 bg-gray-100 flex items-center justify-center border-gray-300 rounded-lg pb-3">
                                <img src="/img/QR.jpg" className='w-52 h-52' alt="QR Code" />
                              </div>
                            )}
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
                                onOptionSelect={(option) => {
                                  setPaymentDetails({ ...paymentDetails, mode: option });
                                  setShowUPI(option === 'UPI');
                                }}
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
                            <label htmlFor="reference" className="block text-sm font-medium text-gray-700">UTR Number/Transaction ID</label>
                            <div className="flex items-center">
                              <Hash className="text-gray-400 mr-2" />
                              <input
                                type="text"
                                id="reference"
                                name="reference"
                                placeholder="Enter UTR Number/Transaction ID"
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
                                max={new Date().toISOString().split('T')[0]}
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
                  </AnimatePresence>

                  <div className="flex justify-end mt-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto px-8 py-3 my-4 bg-black text-white hover:bg-white hover:text-black border-2 border-gray-50 hover:border-black font-normal tracking-wider font-sans rounded-lg shadow-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
                      onClick={handlePlaceOrder}
                    >
                      Place Order
                    </motion.button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
      <AddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onConfirm={handleShippingAddressConfirm}
        selectedAddress={selectedShippingAddressForEdit}
        isNewAddress={isNewAddress}
      />
    </div>
  );
};

export default CartPage;