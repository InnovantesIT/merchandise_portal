import React from 'react';

const OrderSummaryTable = () => {
  const orderItems = [
    { product: 'Spoon', hsn: 'SP001', qty: 10, unitPrice: 1500, tax: '18%' },
    { product: 'Towel', hsn: 'TW001', qty: 20, unitPrice: 2000, tax: '12%' },
    { product: 'Shipping', hsn: 'SH001', qty: 1, unitPrice: 500, tax: '18%' },
    { product: 'Packaging', hsn: 'PK001', qty: 1, unitPrice: 200, tax: '18%' },
  ];

  const calculateSubtotal = (price:any, qty:any) => price * qty;
  const calculateTax = (subtotal:any, taxRate:any) => subtotal * (parseFloat(taxRate) / 100);
  const calculateTotal = (subtotal:any, tax:any) => subtotal + tax;

  const grandTotal = orderItems.reduce((acc, item) => {
    const subtotal = calculateSubtotal(item.unitPrice, item.qty);
    const tax = calculateTax(subtotal, item.tax);
    return acc + calculateTotal(subtotal, tax);
  }, 0);

  return (
    <div className="p-4 sm:p-12 justify-center bg-white max-w-9xl min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 min-w-[640px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-2">Product Name</th>
              <th className="border border-gray-300 p-2">HSN</th>
              <th className="border border-gray-300 p-2">Qty</th>
              <th className="border border-gray-300 p-2">Unit Price</th>
              <th className="border border-gray-300 p-2">Tax</th>
              <th className="border border-gray-300 p-2">Subtotal</th>
              <th className="border border-gray-300 p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {orderItems.map((item, index) => {
              const subtotal = calculateSubtotal(item.unitPrice, item.qty);
              const tax = calculateTax(subtotal, item.tax);
              const total = calculateTotal(subtotal, tax);
              return (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="border border-gray-300 p-2">{item.product}</td>
                  <td className="border border-gray-300 p-2">{item.hsn}</td>
                  <td className="border border-gray-300 p-2">{item.qty}</td>
                  <td className="border border-gray-300 p-2">${item.unitPrice.toFixed(2)}</td>
                  <td className="border border-gray-300 p-2">{item.tax}</td>
                  <td className="border border-gray-300 p-2">${subtotal.toFixed(2)}</td>
                  <td className="border border-gray-300 p-2">${total.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-right">
        <p className="text-xl font-bold">
          Grand Total: <span className="text-2xl">${grandTotal.toFixed(2)}</span>
        </p>
      </div>
</div>)}
export default OrderSummaryTable;