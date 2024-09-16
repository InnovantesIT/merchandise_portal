import React from 'react';

function Footer() {
  return (
    <footer className="bg-white py-2 border-t">
      <div className="container mx-auto px-4 flex flex-col items-center">
      <nav className="flex flex-wrap justify-center space-x-4 pt-3">
  <a href="#" className="sm:text-lg text-sm text-gray-600 hover:text-gray-900 transition-colors hover:underline border-r-2 border-gray-300 pr-2 last:border-none">
    © 2024 Topline
  </a>
  <a href="#" className="sm:text-lg text-sm text-gray-600 hover:text-gray-900 transition-colors hover:underline border-r-2 border-gray-300 pr-2 last:border-none">
    Terms
  </a>
  <a href="#" className="sm:text-lg text-sm text-gray-600 hover:text-gray-900 transition-colors hover:underline border-r-2 border-gray-300 pr-2 last:border-none">
    Privacy Policy
  </a>
  <a href="#" className="sm:text-lg text-sm text-gray-600 hover:text-gray-900 transition-colors hover:underline border-r-2 border-gray-300 pr-2 last:border-none">
    Cookie Policy
  </a>
  <a href="#" className="sm:text-lg text-sm text-gray-600 hover:text-gray-900 transition-colors hover:underline">
    Accessibility
  </a>
</nav>

        <div className="flex items-center">
          <span className="text-sm sm:text-base text-gray-600 mr-3">Powered by:</span>
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
