import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
    <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-black"></div>
  </div>
  );
};

export default Loader;