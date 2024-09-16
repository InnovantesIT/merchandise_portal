import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import FetchImage from '../action/FetchImage';

interface Product {
  name: string;
  rate: number;
  item_id: string;
  quantity: number;
  image_name: string;
  image_path: string; // Include full image path if available
}

interface CardProps {
  product: Product;
  onAddToCart: (product: Product, customerId: string) => void;
  auth: string;
}

const ProductCard: React.FC<CardProps> = ({ product, onAddToCart, auth }) => {
  const [quantity, setQuantity] = useState(product.quantity);
  const [imageContent, setImageContent] = useState('');
  const [isAddedToCart, setIsAddedToCart] = useState(product.quantity > 0);
  const router = useRouter();

  const fetchProductImage = async () => {
    try {
      const image = await FetchImage(product, auth);
      setImageContent(image);
      console.log('Fetched Image:', image); // Debugging log
    } catch (error) {
      console.error('Failed to fetch image:', error);
      setImageContent('img/defaultcard.jpg'); // Default image on error
    }
  };

  useEffect(() => {
    fetchProductImage();
    setQuantity(product.quantity);
    setIsAddedToCart(product.quantity > 0);
  }, [product, auth]); // Proper dependencies to re-run on prop changes

  const handleCartClick = () => {
    const customerId = localStorage.getItem('customer_id');
    if (!customerId) {
      console.error('Customer ID not found in localStorage.');
      return; // Exit if customer ID is not found
    }

    if (isAddedToCart) {
      router.push('/cart');
    } else {
      setQuantity(1);
      setIsAddedToCart(true);
      onAddToCart({ ...product, quantity: 1 }, customerId);
    }
  };

  return (
    <motion.div
      className="card bg-white border border-gray-200 shadow-sm rounded-lg sm:p-4 p-6 hover:shadow-md transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Desktop Layout */}
      <div className="hidden sm:block">
        <div className="mb-4">
          <img
            src={imageContent || 'fallback-image-url.jpg'}
            alt={product.name}
            className="h-48 w-full object-contain"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = 'img/defaultcard.jpg'; // Fallback image
            }}
          />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-800 mb-2">{product.name}</h2>
          <p className="text-xl font-semibold text-gray-700 mb-4">₹ {product.rate}</p>
        </div>
        <div className="flex justify-center">
          <CartButton isAddedToCart={isAddedToCart} handleCartClick={handleCartClick} isMobile={false} />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="sm:hidden flex ml-6">
        <img
          src={imageContent || 'fallback-image-url.jpg'}
          alt={product.name}
          className="h-24 w-24 object-contain mr-3"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = 'img/defaultcard.jpg'; // Fallback image
          }}
        />
        <div className="flex-grow-0 self-center">
          <h2 className="text-sm font-medium text-gray-800 mb-1">{product.name}</h2>
          <div className="flex-shrink-0 items-center gap-3">
            <p className="text-lg font-semibold text-gray-700">₹ {product.rate}</p>
            <CartButton isAddedToCart={isAddedToCart} handleCartClick={handleCartClick} isMobile={true} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CartButton = ({ isAddedToCart, handleCartClick, isMobile }: { isAddedToCart: boolean; handleCartClick: () => void; isMobile: boolean }) => (
  <AnimatePresence>
    <motion.button
      key={isAddedToCart ? 'added' : 'add'}
      onClick={handleCartClick}
      className={`
        ${isMobile ? 'py-1 px-2 text-sm mt-2 font-sans' : 'w-60 py-2 px-4 text-lg'}
        flex justify-center items-center text-white
        ${isAddedToCart ? 'bg-[#585E60]' : 'bg-[#93A2A6]'}
        hover:opacity-90 transition-opacity duration-200 rounded
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isAddedToCart ? 'Go to cart' : 'Add to cart'}
    >
      {isAddedToCart ? (
        <>
          <span className="mr-1">Go to cart</span>
          <ChevronRight color="#ffffff" strokeWidth={1.5} size={isMobile ? 12 : 20} />
        </>
      ) : (
        <>
          <span className="mr-1"></span>
          <span>{isMobile ? 'Add to cart' : 'Add to cart'}</span>
        </>
      )}
    </motion.button>
  </AnimatePresence>
);

export default ProductCard;
