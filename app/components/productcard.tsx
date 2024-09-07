import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface Product {
  name: string;
  rate: number;
  item_id: string;
  quantity: number;
}

interface CardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<CardProps> = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(product.quantity);
  const [isAddedToCart, setIsAddedToCart] = useState(product.quantity > 0);
  const router = useRouter();

  useEffect(() => {
    setQuantity(product.quantity);
    setIsAddedToCart(product.quantity > 0);
  }, [product.quantity]);

  const handleCartClick = () => {
    if (isAddedToCart) {
      router.push('/cart');
    } else {
      setQuantity(1);
      setIsAddedToCart(true);
      onAddToCart({ ...product, quantity: 1 });
    }
  };

  return (
    <motion.div
      className="card bg-white border border-gray-200 shadow-sm rounded-lg p-4 hover:shadow-md transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <img
        src={`https://inventory.zoho.in/api/v1/items/${product.item_id}/image?organization_id=60032377997`}
        alt={product.name}
        className="h-48 w-full object-contain mb-4"
        onError={(e) => (e.currentTarget.src = '/fallback-image.png')} // Fallback image
      />
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-800">{product.name}</h2>
        <p className="text-xl font-semibold text-gray-700">₹ {product.rate}</p>
      </div>
      <div className="flex justify-center mt-4">
        <AnimatePresence>
          <motion.button
            key={isAddedToCart ? 'added' : 'add'}
            onClick={handleCartClick}
            className={`w-60 py-2 flex justify-between items-center text-white ${
              isAddedToCart ? 'bg-[#585E60]' : 'bg-[#93A2A6]'
            } hover:opacity-90 transition-opacity duration-200 px-4`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label={isAddedToCart ? 'Go to cart' : 'Add to cart'}
          >
            {isAddedToCart ? (
              <>
                <span className="text-lg flex-grow text-center">Go to cart</span>
                <ChevronRight color="#ffffff" strokeWidth={1.5} size={20} />
              </>
            ) : (
              <div className='flex-grow  text-center items-center'>
                <span className="text-lg mr-2">+</span>
                <span className="text-lg">Add to cart</span>
              </div>
            )}
          </motion.button>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProductCard;
