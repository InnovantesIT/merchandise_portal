// CartProvider.tsx
"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface Product {
  item_id: string;
  rate: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category?: string;
  group_name?: string;
}

interface CartContextProps {
  products: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (itemId: string) => void;
  updateProductQuantity: (itemId: string, quantity: number) => void;
  cartItemCount: number; // Add this line
}

const CartContext = createContext<CartContextProps | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL

  // Calculate the total cart item count
  const cartItemCount = products.reduce((count, product) => count + product.quantity, 0);

  const addToCart = async (newProduct: Product) => {
    try {
      const response = await axios.post(baseURL+'/api/cart', { 
        item_id: newProduct.item_id,
        quantity: 1 
      });
      
      if (response.status === 200) {
        setProducts((prevProducts) => {
          const productExists = prevProducts.find(
            (product) => product.item_id === newProduct.item_id
          );

          if (productExists) {
            return prevProducts.map((product) =>
              product.item_id === newProduct.item_id
                ? { ...product, quantity: product.quantity + 1 }
                : product
            );
          } else {
            return [...prevProducts, { ...newProduct, quantity: 1 }];
          }
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const response = await axios.delete(baseURL+`/api/cart/${itemId}`);
      
      if (response.status === 200) {
        setProducts((prevProducts) => prevProducts.filter(product => product.item_id !== itemId));
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateProductQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(itemId);
      return;
    }

    try {
      const response = await axios.put(baseURL+`/api/cart/${itemId}`, { quantity });
      
      if (response.status === 200) {
        setProducts((prevProducts) =>
          prevProducts.map(product =>
            product.item_id === itemId ? { ...product, quantity } : product
          )
        );
      }
    } catch (error) {
      console.error('Error updating product quantity:', error);
    }
  };

  return (
    <CartContext.Provider value={{ products, addToCart, removeFromCart, updateProductQuantity, cartItemCount }}>
      {children}
    </CartContext.Provider>
  );
};
