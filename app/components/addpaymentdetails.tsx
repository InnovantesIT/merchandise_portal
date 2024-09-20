{/* <AnimatePresence mode="wait">
{showPaymentDetails && (
  isPaymentPlaced ? (
    <motion.div
      key="payment-details"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="relative bg-white border rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6"
    >
      
      <button
        onClick={handleEditPaymentDetails}
        className="absolute top-4 md:top-8 right-4 text-gray-600 hover:text-gray-800"
        disabled
      >
        <Edit3 size={18} />
        </button>

      <h2 className="text-md md:text-lg mb-4 md:mb-8 inline-flex gap-2 md:gap-3 items-center">
        <CreditCard size={20} />
        Payment Details
      </h2>
      <div className="mb-4 md:mb-6">
        <p className="text-black text-sm font-semibold font-sans">Payment Mode</p>
        <p className="text-[#36383C] text-sm">{paymentDetails.mode}</p>
      </div>
      <div className="mb-4 md:mb-6">
        <p className="text-black text-sm font-semibold font-sans">Reference Number</p>
        <p className="text-[#36383C] text-sm">{paymentDetails.reference}</p>
      </div>
      <div className="mb-4 md:mb-6">
        <p className="text-black text-sm font-semibold font-sans">Payment Date</p>
        <p className="text-[#36383C] text-sm">{paymentDetails.date}</p>
      </div>
    </motion.div>
  ) : (
    <motion.div
      key="payment-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-[#FAFBFF] border rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6"
    >
      <h2 className="text-md md:text-lg font-semibold font-sans mb-4">Add Payment Details</h2>
      <form onSubmit={handlePaymentSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-sans text-gray-700 mb-2">Payment Mode</label>
          <CustomDropdown
            options={paymentOptions}
            selectedOption={paymentDetails.mode}
            onOptionSelect={(option) => setPaymentDetails({ ...paymentDetails, mode: option })}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-sans text-gray-700 mb-2">Reference Number</label>
          <input
            type="text"
            placeholder="Enter reference here"
            className="w-full p-2 border border-gray-300 rounded"
            value={paymentDetails.reference}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, reference: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-sans text-gray-700 mb-2">Payment Date</label>
          <input
            type="date"
            className="w-full p-2 border border-gray-300 rounded"
            value={paymentDetails.date}
            max={today}
            onChange={(e) => setPaymentDetails({ ...paymentDetails, date: e.target.value })}
          />
        </div>
        {errorMessage && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-sm mb-4"
          >
            {errorMessage}
          </motion.p>
        )}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-black text-white py-2 rounded-md transition-all duration-100 ease-in-out hover:bg-[#171b1d]"
        >
          Place Order
        </motion.button>
      </form>
    </motion.div>
  )
)}
</AnimatePresence> */}