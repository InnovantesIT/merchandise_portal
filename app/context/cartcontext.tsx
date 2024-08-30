"use client";
import React, { createContext, useContext, useState } from 'react';

interface Product {
  name: string;
  price: number;
  image: string;
  quantity: number;
  category?: string;
}

interface CartContextProps {
  products: Product[];
  addToCart: (product: Product) => void;
  removeFromCart: (productName: string) => void;
  updateProductQuantity: (productName: string, quantity: number) => void;
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

  const addToCart = (newProduct: Product) => {
    setProducts((prevProducts) => {
      const productExists = prevProducts.find(
        (product) => product.name === newProduct.name
      );

      if (productExists) {
        return prevProducts.map((product) =>
          product.name === newProduct.name
            ? { ...product, quantity: product.quantity + 1 }
            : product
        );
      } else {
        return [...prevProducts, { ...newProduct, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productName: string) => {
    setProducts((prevProducts) => {
      const updatedProducts = prevProducts.filter(product => product.name !== productName);
      console.log('Removed Product:', productName);
      console.log('Updated Products:', updatedProducts);
      return updatedProducts;
    });
  };

  const updateProductQuantity = (productName: string, quantity: number) => {
    setProducts((prevProducts) =>
      prevProducts.map(product =>
        product.name === productName ? { ...product, quantity } : product
      )
    );
  };

  return (
    <CartContext.Provider value={{ products, addToCart, removeFromCart, updateProductQuantity }}>
      {children}
    </CartContext.Provider>
  );
};