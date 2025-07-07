"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, MapPin, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShippingAddress {
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
  tax_info_id?: string;
}

interface ShippingAddressDropdownProps {
  addresses: ShippingAddress[];
  selectedAddressId: string;
  onAddressSelect: (addressId: string) => void;
  onAddNewAddress: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const ShippingAddressDropdown: React.FC<ShippingAddressDropdownProps> = ({
  addresses = [],
  selectedAddressId,
  onAddressSelect,
  onAddNewAddress,
  placeholder = "Select shipping address",
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedAddress = addresses?.find(addr => addr.address_id === selectedAddressId);

  const formatAddress = (address: ShippingAddress) => {
    const parts = [
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

  const handleAddressSelect = (addressId: string) => {
    onAddressSelect(addressId);
    setIsOpen(false);
  };

  const handleAddNewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddNewAddress();
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200 ${
          disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'hover:border-gray-400'
        }`}
      >
        <div className="flex items-center flex-1 min-w-0">
          <MapPin className="text-gray-400 mr-2 flex-shrink-0" size={16} />
          <div className="flex-1 min-w-0">
            {selectedAddress ? (
              <div className="truncate">
                <div className="font-medium text-gray-900 truncate">
                  {selectedAddress.attention}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {formatAddress(selectedAddress)}
                </div>
              </div>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
        </div>
        <ChevronDown 
          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
          size={16} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {!addresses || addresses.length === 0 ? (
              <div className="p-3 text-center text-gray-500">
                No addresses found
              </div>
            ) : (
              <>
                {addresses.map((address) => (
                  <button
                    key={address.address_id}
                    type="button"
                    onClick={() => handleAddressSelect(address.address_id)}
                    className={`w-full p-3 text-left hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100 last:border-b-0 ${
                      selectedAddressId === address.address_id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      <MapPin className="text-gray-400 mr-2 mt-0.5 flex-shrink-0" size={14} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 mb-1">
                          {address.attention}
                        </div>
                        <div className="text-sm text-gray-600 leading-relaxed">
                          {formatAddress(address)}
                        </div>
                        {address.phone && (
                          <div className="text-xs text-gray-500 mt-1">
                            📞 {address.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}
            
            {/* Add New Address Button */}
            <button
              type="button"
              onClick={handleAddNewClick}
              className="w-full p-3 text-left hover:bg-gray-50 transition-colors duration-150 border-t border-gray-200 flex items-center text-blue-600 hover:text-blue-700"
            >
              <Plus className="mr-2" size={14} />
              <span className="font-medium">Add New Address</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShippingAddressDropdown; 