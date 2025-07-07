import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Address {
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
}

interface CustomShippingAddress {
  attention: string;
  address: string;
  country: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (address: CustomShippingAddress, isModified: boolean) => void;
  selectedAddress?: Address | null;
  isNewAddress?: boolean;
}

const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedAddress,
  isNewAddress = false
}) => {
  const [formData, setFormData] = useState<CustomShippingAddress>({
    attention: '-',
    address: '',
    country: '',
    city: '',
    state: '',
    zip: '',
    phone: ''
  });

  const [originalData, setOriginalData] = useState<CustomShippingAddress>({
    attention: '-',
    address: '',
    country: '',
    city: '',
    state: '',
    zip: '',
    phone: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (isNewAddress) {
        // For new address, all fields are empty except attention
        const newAddressData = {
          attention: '-',
          address: '',
          country: '',
          city: '',
          state: '',
          zip: '',
          phone: ''
        };
        setFormData(newAddressData);
        setOriginalData(newAddressData);
      } else if (selectedAddress) {
        // Parse existing address and populate fields with original attention value
        const parsedAddress = {
          attention: selectedAddress.attention, // Keep original attention value
          address: `${selectedAddress.address}${selectedAddress.street2 ? ', ' + selectedAddress.street2 : ''}`,
          country: selectedAddress.country,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zip: selectedAddress.zip,
          phone: selectedAddress.phone || ''
        };
        setFormData(parsedAddress);
        setOriginalData(parsedAddress);
      }
    }
  }, [isOpen, selectedAddress, isNewAddress]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isFormModified = () => {
    return Object.keys(formData).some(key => {
      if (key === 'attention') return false; // Don't check attention field for modification
      return formData[key as keyof CustomShippingAddress] !== originalData[key as keyof CustomShippingAddress];
    });
  };

  const handleConfirm = () => {
    const isModified = isFormModified() || isNewAddress;
    onConfirm(formData, isModified);
    onClose();
  };

  const isFormValid = () => {
    // For existing addresses (prefilled), always allow confirmation
    if (!isNewAddress && selectedAddress) {
      return true;
    }
    
    // For new addresses, check if required fields are filled
    return formData.address.trim() !== '' && 
           formData.country.trim() !== '' && 
           formData.city.trim() !== '' && 
           formData.state.trim() !== '' && 
           formData.zip.trim() !== '';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold">
              {isNewAddress ? 'Add New Address' : 'Confirm Address'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Enter address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Enter city"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Enter state"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code *
              </label>
              <input
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Enter ZIP code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Enter country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isFormValid()}
              className={`px-4 py-2 rounded-lg font-medium ${
                isFormValid()
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Confirm
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddressModal; 