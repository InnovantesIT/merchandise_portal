import React from 'react';

function Footer() {
  return (
    <footer className="bg-white py-2 border-t">
       
  

        <div className=" container mx-auto px-4 flex items-center justify-between">
        <a href="/privacy-policy" className="sm:text-lg text-sm text-gray-600 hover:text-gray-900 transition-colors hover:no-underline">
          Privacy Policy
        </a>
        <div className="flex items-center">
          <span className="text-sm sm:text-base text-gray-600 mr-3">Powered by</span>
          <img
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
            src="/img/Topline_Logo.jpg"
            alt="Topline Logo"
          />
          </div>
        </div>
    </footer>
  );
}

export default Footer;
