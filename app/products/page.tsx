"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/app/context/cartcontext";
import ProductCard from "@/app/components/productcard";
import Head from "next/head";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "@/app/components/header";
import { motion, AnimatePresence } from "framer-motion";
import { RiFilterLine, RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";

interface Product {
  name: string;
  price: number;
  image: string;
  quantity: number;
  category?: string;
}

const initialProducts: Product[] = [
  { name: "Feedback Standees", price: 100, image: "/img/Feedback Standees- 100.png", quantity: 0, category: "Standees" },
  { name: "Pitstop Standees", price: 200, image: "/img/Pitstop Standees- 200.png", quantity: 0, category: "Standees" },
  { name: "Wifi Pop", price: 50, image: "/img/Wifi Pop- 50.png", quantity: 0, category: "POP Materials" },
  { name: "Next Service Due Sticker", price: 20, image: "/img/Next Service Due Sticker- 20.png", quantity: 0, category: "Stickers" },
  { name: "Mobile Charging Station", price: 2000, image: "/img/Mobile Charging Station- 2000.png", quantity: 0, category: "Equipment" },
  { name: "Customer Information", price: 30, image: "/img/Customer Information- 30.png", quantity: 0, category: "POP Materials" },
  { name: "QR Code POSM Kit", price: 250, image: "/img/QR Code POSM Kit- 250.png", quantity: 0, category: "POSM" },
];

const ProductsPage: React.FC = () => {
  const { addToCart, removeFromCart } = useCart();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [filter, setFilter] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleAddToCart = (product: Product) => {
    const updatedProduct = { ...product, quantity: product.quantity + 1 };
    updateProductList(updatedProduct);
    addToCart(updatedProduct);
    showToast(`${product.name} added to cart!`, "success");
  };

  const handleRemoveFromCart = (product: Product) => {
    const updatedProduct = { ...product, quantity: Math.max(product.quantity - 1, 0) };
    updateProductList(updatedProduct);
    removeFromCart(updatedProduct);
    showToast(`${product.name} removed from cart.`, "error");
  };

  const updateProductList = (updatedProduct: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => (p.name === updatedProduct.name ? updatedProduct : p))
    );
  };

  const showToast = (message: string, type: "success" | "error") => {
    var position =
      window.innerWidth <= 768 ? "top-right" : "bottom-right"; // "top-right" for mobile, "bottom-right" for desktop
    const options = {
      position: position,
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    };
  
    if (type === "success") {
      toast.success(message, options);
    } else {
      toast.error(message, options);
    }
  };
  

  const handleFilterChange = (category: string | null) => {
    setFilter(category === "All" ? null : category);
  };

  const filteredProducts = products.filter((product) => !filter || product.category === filter);

  const cartItemCount = products.reduce((acc, product) => acc + product.quantity, 0);

  const pageTitle = filter ? `Products - ${filter}` : "Browse Our Products";

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <meta
          name="description"
          content={`Browse and order products from ${filter ? filter : "various categories"}.`}
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="max-w-9xl mx-auto">
        <Header cartItemCount={cartItemCount} />
        <ToastContainer />
        <div className="px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-black mt-9 text-xl font-sans font-semibold flex items-center gap-3"
          >
            <img src="/icons/hi.svg" className="w-6 h-6" alt="Hi Icon" />
            Hi Kailash! Order now!
          </motion.div>
          <div className="flex flex-col md:flex-row mt-8 gap-8">
            <div className="md:w-1/4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white p-6 rounded-lg "
              >
                <div 
                  className="flex items-center justify-between cursor-pointer md:cursor-default"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <div className="flex items-center gap-1">
                    <RiFilterLine className="w-5 h-6 mb-1" />
                    <span className="text-xl font-semibold text-pretty font-sans">Filter</span>
                  </div>
                  <div className="md:hidden">
                    {isFilterOpen ? <RiArrowUpSLine /> : <RiArrowDownSLine />}
                  </div>
                </div>
                <AnimatePresence>
                  {(isFilterOpen || window.innerWidth >= 768) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2 font-sans mt-4"
                    >
                      {["All", "Standees", "POP Materials", "Stickers", "Equipment", "POSM"].map(
                        (category) => (
                          <motion.label
                            key={category}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="category"
                              value={category}
                              checked={filter === (category === "All" ? null : category)}
                              onChange={() => handleFilterChange(category === "All" ? null : category)}
                              className="form-radio text-indigo-600"
                            />
                            <span className="text-gray-700 capitalize">{category}</span>
                          </motion.label>
                        )
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            <div className="md:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={() => handleAddToCart(product)}
                    onRemoveFromCart={() => handleRemoveFromCart(product)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductsPage;