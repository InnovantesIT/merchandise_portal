import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X, ArrowRight,ShoppingCart } from 'lucide-react';

interface Product {
  name: string;
  rate: number;
  item_name: string;
  image_name: string;
  image_path: string;
  quantity: number;
  category?: string;
  customer_id: number;
  item_id: string;
  group_name?: string;
}

interface CartButtonProps {
  isAddedToCart: boolean;
  handleCartClick: () => void;
  isMobile: boolean;
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
    <>
    <motion.div
  className="
    card bg-white border border-gray-200 shadow-sm rounded-xl
    max-w-2xl overflow-hidden hover:shadow-lg hover:border-gray-300
    transition-all duration-300

    flex flex-col h-full
  "
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Main content grows to push button down */}
  <div className="flex-1">
    {/* Desktop Layout */}
    <div className="hidden sm:block">
      <div className="mb-6 cursor-pointer group" onClick={openModal}>
        <div className="overflow-hidden rounded-lg bg-gray-50">
          <img
            src={imageSrc}
            alt={product.item_name}
            className="w-full  group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={handleImageError}
          />
        </div>
      </div>
      
      <div className="text-center space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 line-clamp-2">
          {product.item_name}
        </h2>
        
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <span>Amount to be Paid Now</span>
          <ArrowRight size={16} className="text-gray-400" />
          <span className="font-bold text-lg text-gray-800">₹{product.rate}</span>
        </div>
      </div>
    </div>

    {/* Mobile Layout */}
    <div className="sm:hidden flex items-start gap-4 p-4">
      <div className="cursor-pointer flex-shrink-0 group" onClick={openModal}>
        <div className="overflow-hidden rounded-lg bg-gray-50">
          <img
            src={imageSrc}
            alt={product.item_name}
            className="h-24 w-24 object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={handleImageError}
          />
        </div>
      </div>
      
      <div className="flex flex-col justify-between min-h-24 flex-1">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-800 line-clamp-2">
            {product.item_name}
          </h2>
          
          <div className="space-y-1">
            <span className="text-xs text-gray-500">Amount to be Paid Now</span>
            <p className="text-lg font-bold text-gray-800">₹{product.rate}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Button always at the bottom */}
  <div className="mt-auto p-4">
    <CartButton 
      isAddedToCart={isAddedToCart} 
      handleCartClick={handleCartClick} 
      isMobile={false /* or true, depending on screen */} 
    />
  </div>
</motion.div>


      {/* Image Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
                <img
                  src={imageSrc}
                  alt={product.item_name}
                  className="w-full h-auto max-h-[80vh] object-contain"
                  onError={handleImageError}
                />
              </div>
              
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white bg-black/50 backdrop-blur-sm rounded-full p-2 hover:bg-black/70 transition-colors duration-200"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const CartButton: React.FC<CartButtonProps> = ({
  isAddedToCart,
  handleCartClick,
  isMobile,
}) => {
  // Color classes based on added state
  const colorClasses = isAddedToCart
    ? 'bg-white text-black hover:bg-gray-100'
    : 'bg-black text-white hover:bg-gray-800';

  // Size + padding based on mobile vs desktop
  const sizeClasses = isMobile
    ? 'w-full py-2 px-4 text-sm'
    : 'w-full py-3 px-6 text-base mx-auto';

  return (
    <motion.button
      onClick={handleCartClick}
      className={`
        ${sizeClasses}
        ${colorClasses}
        flex justify-center items-center font-medium rounded-lg
        transition-all duration-200 shadow-sm hover:shadow-md
        focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-label={isAddedToCart ? 'Go to cart' : 'Add to cart'}
    >
      <span className="mr-2">
        {isAddedToCart ? 'Go to cart' : 'Add to cart'}
      </span>

      {isAddedToCart ? (
        !isMobile ? (
          // Desktop: show ShoppingCart icon
          <ShoppingCart size={20} className="text-black/70" />
        ) : null
      ) : (
        // "Add to cart" state: chevron
        <ShoppingCart size={isMobile ? 16 : 20} className="text-white/80" />
      )}
    </motion.button>
  );
};
export default ProductCard;