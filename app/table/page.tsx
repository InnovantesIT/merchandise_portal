"use client";

import React from 'react';
import Header from "@/app/components/header";

const OrderTable = () => {
  return (
    <div className="min-h-screen bg-[#F6F8FD]">
      <Header cartItemCount={0} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dealer Orders</h1>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Dealer Name", "City", "Order No", "Order Placed Date", "Status"].map((header) => (
                  <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { name: "ADITYAADI CARS PRIVATE LIMITED", city: "ANANTAPUR", orderNo: "D0011721", date: "13th August 2024", status: "Dispatched" },
                { name: "ASAGO AUTOMOTIVE PRIVATE LIMITED", city: "GUWAHATI", orderNo: "D0012812", date: "10th August 2024", status: "Delivered" },
                { name: "AUTO KING COMBINES PRIVATE LIMITED", city: "INDORE", orderNo: "D0011281", date: "30th July 2024", status: "Delivered" },
                { name: "BENCHMARK MOTORS PRIVATE LIMITED", city: "MUMBAI", orderNo: "D0089121", date: "15th July 2024", status: "Delivered" },
                { name: "BALARAM CARS PRIVATE LIMITED", city: "PALANPUR", orderNo: "D0012181", date: "1st July 2024", status: "Delivered" },
              ].map((order, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.city}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.orderNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === "Dispatched" ? "bg-blue-500 text-white" : "bg-green-100 text-green-800"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default OrderTable;