import React, { useState, useEffect } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  name: string;
  price: string;
  image: string;
  quantity: number;
}

interface CardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (product: Product) => void;
}

const ProductCard: React.FC<CardProps> = ({ product, onAddToCart, onRemoveFromCart }) => {
  const [quantity, setQuantity] = useState(product.quantity);
  const [isAddedToCart, setIsAddedToCart] = useState(product.quantity > 0);

  useEffect(() => {
    setQuantity(product.quantity);
    setIsAddedToCart(product.quantity > 0);
  }, [product.quantity]);

  const handleCartClick = () => {
    if (isAddedToCart) {
      setQuantity(0);
      setIsAddedToCart(false);
      onRemoveFromCart(product);
    } else {
      setQuantity(1);
      setIsAddedToCart(true);
      onAddToCart({ ...product, quantity: 1 });
    }
  };

  return (
    <motion.div
      className="card  bg-white  border-[1.5px] border-gray-100 pb-3 pt-3 mb-3 hover:scale-105 font-sans font-normal"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.img
        src={product.image}
        alt={product.name}
        className="h-52 mx-auto"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      />
      <div className="text-center">
        <motion.h2
          className="text-lg font-sans mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {product.name}
        </motion.h2>
        <motion.p
          className="text-gray-500 font-sans text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          ₹{product.price}
        </motion.p>
      </div>
      <div className="flex justify-center items-center mt-3 font-sans">
        <AnimatePresence mode="wait">
          <motion.button
            key={isAddedToCart ? 'added' : 'add'}
            onClick={handleCartClick}
            className={`py-2 px-4 rounded flex items-center transition-all duration-100 ease-in-out ${
              isAddedToCart ? 'bg-green-500 text-white' : 'bg-black text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {isAddedToCart ? (
              <>
                <FaShoppingCart className="mr-2" />
                <span className='font-sans text-sm'>Remove from Cart</span>
              </>
            ) : (
              <>
              < span className="text-sm font-sans">
              Add to Cart
              </span>
              </>
            )}
          </motion.button>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProductCard;
