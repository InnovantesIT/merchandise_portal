"use client";
import React from 'react';
import { useCart } from '@/app/context/cartcontext';

const OrderDetails: React.FC = () => {
  const { cartItems } = useCart();

  const calculateTotal = () => {
    console.log('Cart Items:', cartItems); // Debugging line
    return cartItems.reduce((total:any, item:any) => total + item.quantity * item.price, 0);
  };

  return (
    <div>
      <h2>Order Summary</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cartItems.map((item:any) => (
            <div key={item.id}>
              <p><strong>{item.name}</strong></p>
              <p>Quantity: {item.quantity}</p>
              <p>Price: ${item.price.toFixed(2)}</p>
              <p>Total: ${(item.quantity * item.price).toFixed(2)}</p>
            </div>
          ))}
          <h3>Total Amount: ${calculateTotal().toFixed(2)}</h3>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
