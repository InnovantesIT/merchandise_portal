import React, { useState, useRef, useEffect } from 'react';
import { RiArrowDropDownLine } from "react-icons/ri";

interface DropdownProps {
  options: string[];
  selectedOption: string;
  onOptionSelect: (option: string) => void;
}

const CustomDropdown: React.FC<DropdownProps> = ({ options, selectedOption, onOptionSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: string) => {
    onOptionSelect(option);
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        className="w-full bg-white border border-gray-300 rounded p-2 flex justify-between items-center"
        onClick={toggleDropdown}
      >
        {selectedOption || 'Select Payment Mode'}
        <RiArrowDropDownLine className={`transition-transform duration-200 size-7 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <ul className="absolute w-full mt-2 bg-white border border-gray-300 rounded shadow-lg z-10">
          {options.map((option, index) => (
            <li
              key={index}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
