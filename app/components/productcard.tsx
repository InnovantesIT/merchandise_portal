import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';

interface Product {
  name: string;
  rate: number;
  item_name: string;
  image_name: string;
  image_path: string; // This may not be needed if you're not using it.
  quantity: number;
  category?: string;
  customer_id: number;
  item_id: string;
  group_name?: string;
}

interface CardProps {
  product: Product;
  onAddToCart: (product: Product, customerId: string) => void;
  auth: string;
}

const ProductCard: React.FC<CardProps> = ({ product, onAddToCart, auth }) => {
  const [quantity, setQuantity] = useState(product.quantity);
  const [isAddedToCart, setIsAddedToCart] = useState(product.quantity > 0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(product.image_name || 'img/defaultcard.jpg');
  const router = useRouter();

  useEffect(() => {
    setQuantity(product.quantity);
    setIsAddedToCart(product.quantity > 0);
    setImageSrc(product.image_name || 'img/defaultcard.jpg');
  }, [product]);

  const handleCartClick = () => {
    const customerId = localStorage.getItem('customer_id');
    if (!customerId) {
      console.error('Customer ID not found in localStorage.');
      return;
    }

    if (isAddedToCart) {
      router.push('/cart');
    } else {
      setQuantity(1);
      setIsAddedToCart(true);
      onAddToCart({ ...product, quantity: 1 }, customerId);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageSrc('img/defaultcard.jpg');
  };

  return (
    <motion.div
      className="card bg-white border border-gray-200 shadow-sm rounded-lg sm:p-4 p-6 max-w-2xl overflow-hidden hover:shadow-md transition-shadow duration-300 "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Desktop Layout */}
      <div className="hidden sm:block">
        <div className="mb-4 cursor-pointer" onClick={openModal}>
          <img
            src={imageSrc}
            alt={product.item_name}
            className="h-48 w-full object-contain"
            loading="lazy"
            onError={handleImageError}
          />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-800 mb-2">{product.item_name}</h2>
          <p className="text-xl font-semibold text-gray-700 mb-4">₹ {product.rate}</p>
        </div>
        <div className="flex justify-center">
          <CartButton isAddedToCart={isAddedToCart} handleCartClick={handleCartClick} isMobile={false} />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="sm:hidden flex ml-6">
        <div className="cursor-pointer flex-shrink-0" onClick={openModal}>
          <img
            src={imageSrc}
            alt={product.item_name}
            className="h-24 w-24 object-contain mr-3"
            loading="lazy"
            onError={handleImageError}
          />
        </div>
        <div className="flex flex-col justify-center">
          <h2 className="text-sm font-medium text-gray-800 mb-1 max-w-full overflow-hidden">
            {product.item_name}
          </h2>
          <div className="flex items-center gap-3">
            <p className="text-lg font-semibold text-gray-700">₹ {product.rate}</p>
            <CartButton isAddedToCart={isAddedToCart} handleCartClick={handleCartClick} isMobile={true} />
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-xl max-h-[90vh] w-full m-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={imageSrc}
                alt={product.name}
                className="w-xl h-xl object-contain"
                onError={handleImageError}
              />
              <button
                onClick={closeModal}
                className="absolute sm:top-2 sm:right-2 top-1 right-1 text-white bg-black bg-opacity-50 rounded-full sm:p-2 p-1 hover:bg-opacity-75 transition duration-300"
              >
                <X className="block lg:hidden" size={20} />
                <X className="hidden lg:block" size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
