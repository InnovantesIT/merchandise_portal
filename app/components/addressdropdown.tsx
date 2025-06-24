import React, { useState, useRef, useEffect } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";
import { Plus } from "lucide-react";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  selectedOption: string;
  onOptionSelect: (value: string) => void;
  onAddNewAddress: () => void;
  className?: string;
}

const AddressDropdown: React.FC<DropdownProps> = ({
  options,
  selectedOption,
  onOptionSelect,
  onAddNewAddress,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleOptionSelect = (value: string) => {
    onOptionSelect(value);
    setIsOpen(false);
  };

  const handleAddNewAddress = () => {
    onAddNewAddress();
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        className="w-full bg-white rounded flex justify-between items-center"
        onClick={toggleDropdown}
      >
        {options.find((opt) => opt.value === selectedOption)?.label || "Select an Address"}
        <RiArrowDropDownLine
          className={`transition-transform duration-200 text-3xl ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <ul className="absolute w-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 max-h-48 overflow-auto">
          {options.map((option) => (
            <li
              key={option.value}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleOptionSelect(option.value)}
            >
              {option.label}
            </li>
          ))}
          <li
            className="p-2 hover:bg-gray-100 cursor-pointer border-t border-gray-200 flex items-center gap-2 text-blue-600 font-medium"
            onClick={handleAddNewAddress}
          >
            <Plus size={16} />
            Add new address
          </li>
        </ul>
      )}
    </div>
  );
};

export default AddressDropdown;
