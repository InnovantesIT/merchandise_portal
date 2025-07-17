import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X, ArrowRight, ShoppingCart, ChevronLeft } from 'lucide-react';

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
  moq?: number; // Minimum Order Quantity
  description?: string;
  hsn_or_sac?: string;
  tax_percentage?: number;
  additional_images?: string[]; // Add additional images field
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
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState(product.image_name || 'img/defaultcard.jpg');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();

  // Create array of all images (main image + additional images)
  const allImages = [
    product.image_name || 'img/defaultcard.jpg',
    ...(product.additional_images || [])
  ];

  useEffect(() => {
    setQuantity(product.quantity);
    setIsAddedToCart(product.quantity > 0);
    setImageSrc(product.image_name || 'img/defaultcard.jpg');
    setCurrentImageIndex(0); // Reset to first image when product changes
  }, [product]);

  // Auto-scroll effect
  useEffect(() => {
    if (isModalOpen && allImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
        );
      }, 4000); // Change image every 3 seconds

      return () => clearInterval(interval);
    }
  }, [isModalOpen, allImages.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isModalOpen) return;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          prevImage();
          break;
        case 'ArrowRight':
          event.preventDefault();
          nextImage();
          break;
        case 'Escape':
          event.preventDefault();
          closeModal();
          break;
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isModalOpen]);

  const handleCartClick = () => {
    const customerId = localStorage.getItem('customer_id');
    if (!customerId) {
      console.error('Customer ID not found in localStorage.');
      return;
    }

    if (isAddedToCart) {
      router.push('/cart');
    } else {
      // Use MOQ value if available and greater than 0, otherwise use 1
      const quantityToAdd = (product.moq && product.moq > 0) ? product.moq : 1;
      setQuantity(quantityToAdd);
      setIsAddedToCart(true);
      onAddToCart({ ...product, quantity: quantityToAdd }, customerId);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setCurrentImageIndex(0);
  };
  const closeModal = () => setIsModalOpen(false);
  const openDescriptionModal = () => setIsDescriptionModalOpen(true);
  const closeDescriptionModal = () => setIsDescriptionModalOpen(false);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageSrc('img/defaultcard.jpg');
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? allImages.length - 1 : prevIndex - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const renderDescription = () => {
    if (!product.description) return null;
    
    const isLongDescription = product.description.length > 80;
    const displayText = product.description.substring(0, 80) + (isLongDescription ? '...' : '');

    return (
      <div className="text-xs text-gray-500 mt-1 sm:px-3 px-0">
        <span>{displayText}</span>
        {isLongDescription && (
          <button
            onClick={openDescriptionModal}
            className="ml-1 text-yellow-500 hover:underline font-medium"
          >
            View More
          </button>
        )}
      </div>
    );
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
      <div className="mb-6 cursor-pointer group relative" onClick={openModal}>
        <div className="overflow-hidden rounded-lg bg-gray-50">
          <img
            src={imageSrc}
            alt={product.item_name}
            className="w-full h-[300px]  group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={handleImageError}
          />
          {/* Image count indicator */}
          {allImages.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
              +{allImages.length - 1}
            </div>
          )}
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
        
        <div className="text-xs text-gray-500">
          Min. Order Qty: {(product.moq && product.moq > 0) ? product.moq : 1}
        </div>
        {renderDescription()}
      </div>
    </div>

    {/* Mobile Layout */}
    <div className="sm:hidden flex items-start gap-4 p-4">
      <div className="cursor-pointer flex-shrink-0 group relative" onClick={openModal}>
        <div className="overflow-hidden rounded-lg bg-gray-50">
          <img
            src={imageSrc}
            alt={product.item_name}
            className="h-24 w-24 object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={handleImageError}
          />
          {/* Image count indicator */}
          {allImages.length > 1 && (
            <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-full">
              +{allImages.length - 1}
            </div>
          )}
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
            <p className="text-xs text-gray-500">Min. Order Qty: {(product.moq && product.moq > 0) ? product.moq : 1}</p>
            {renderDescription()}
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
              className="relative max-w-4xl max-h-[80vh] w-full bg-white rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Main Image Container */}
              <div className="relative bg-black">
                <img
                  src={allImages[currentImageIndex]}
                  alt={`${product.item_name} - Image ${currentImageIndex + 1}`}
                  className="w-full h-auto max-h-[60vh] object-contain mx-auto"
                  onError={handleImageError}
                />
                
                {/* Navigation Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 backdrop-blur-sm rounded-full p-3 hover:bg-black/70 transition-colors duration-200 z-10"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 backdrop-blur-sm rounded-full p-3 hover:bg-black/70 transition-colors duration-200 z-10"
                      aria-label="Next image"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                {/* Close Button */}
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-white bg-black/50 backdrop-blur-sm rounded-full p-2 hover:bg-black/70 transition-colors duration-200 z-10"
                  aria-label="Close modal"
                >
                  <X size={24} />
                </button>

                {/* Image Counter */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 left-4 text-white bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                    {currentImageIndex + 1} / {allImages.length}
                  </div>
                )}

                {/* Auto-scroll indicator */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 right-4 text-white bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-xs">
                    Auto-scroll
                  </div>
                )}
              </div>

              {/* Thumbnail Navigation */}
              {allImages.length > 1 && (
                <div className="p-4 bg-gray-50">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {allImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => goToImage(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          currentImageIndex === index
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'img/defaultcard.jpg';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Info */}
              
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Description Modal */}
      <AnimatePresence>
        {isDescriptionModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
            onClick={closeDescriptionModal}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-2xl w-full bg-white rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {product.item_name}
                  </h3>
                  <button
                    onClick={closeDescriptionModal}
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    aria-label="Close modal"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Amount to be Paid Now</span>
                    <ArrowRight size={16} className="text-gray-400" />
                    <span className="font-bold text-lg text-gray-800">₹{product.rate}</span>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Min. Order Qty: {(product.moq && product.moq > 0) ? product.moq : 1}
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-800 mb-2">Description</h4>
                    <p className="text-gray-600 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>
              </div>
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